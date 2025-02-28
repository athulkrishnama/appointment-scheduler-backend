const Appointment = require('../../models/appointment');
const mongoose = require('mongoose')

const getDashboardData = async (req, res) => {
    try {
        const period = req.query.period || 'weekly';
        const today = new Date();
        let filter = {};
        let groupBy = {};
        let formattedData = {};

        if (period === 'weekly') {
            const startOfWeek = new Date();
            startOfWeek.setDate(today.getDate() - 6); 

            filter = { date: { $gte: startOfWeek }, serviceProvider:new mongoose.Types.ObjectId(req.userId) };
            groupBy = {
                _id: { $dayOfWeek: "$createdAt" },
                count: { $sum: 1 }
            };

            formattedData = { 1: "Sunday", 2: "Monday", 3: "Tuesday", 4: "Wednesday", 5: "Thursday", 6: "Friday", 7: "Saturday" };
        } 
        else if (period === 'monthly') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); 
        
            filter = { createdAt: { $gte: startOfMonth, $lt: endOfMonth }, serviceProvider: new mongoose.Types.ObjectId(req.userId) };
        
            groupBy = {
                _id: { $dayOfMonth: "$createdAt" }, 
                count: { $sum: 1 }
            };
        
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        
            formattedData = {};
            for (let i = 1; i <= daysInMonth; i++) {
                formattedData[i] = 0;
            }
        
            const aggregationResult = await Appointment.aggregate([
                { $match: filter },
                { $group: groupBy },
                { $sort: { _id: 1 } }
            ]);
        
            aggregationResult.forEach(({ _id, count }) => {
                if (_id >= 1 && _id <= daysInMonth) {
                    formattedData[_id] = count;
                }
            });
            delete formattedData[0];
            return res.status(200).json({ success: true, data: formattedData });
        }
        
        
        
        else if (period === 'yearly') {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            filter = { createdAt: { $gte: startOfYear } };

            groupBy = {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            };

            formattedData = { 1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec" };
        }
        console.log(req.userId)
        const results = await Appointment.aggregate([
            { $match: filter },
            { $group: groupBy },
            { $sort: { "_id": 1 } }
        ]);

        let responseData = Object.fromEntries(
            Object.entries(formattedData).map(([key, value]) => [formattedData[key], 0])
        );

        results.forEach(({ _id, count }) => {
            responseData[formattedData[_id]] = count;
        });

        res.status(200).json({ success: true, data: responseData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
};




const getSalesReport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit == 'all' ? null : parseInt(req.query.limit) || 5;
        const period = req.query.period || 'week';
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        const status = req.query.status;

        const filter = {}

        if (status) {
            filter.status = status;
        }

        if (period === 'daily') {
            const currDate = new Date(Date.now());
            currDate.setHours(0, 0, 0, 0);
            filter.date = { $eq: currDate }
        } else if (period === 'weekly') {
            const currDate = new Date(Date.now());
            const prevDate = new Date(currDate);
            prevDate.setDate(prevDate.getDate() - 7);
            filter.date = { $gte: prevDate, $lte: currDate }
        } else if (period === 'monthly') {
            const currDate = new Date(Date.now());
            const prevDate = new Date(currDate);
            prevDate.setMonth(prevDate.getMonth() - 1);
            filter.date = { $gte: prevDate, $lte: currDate }
        } else if (period === 'yearly') {
            const currDate = new Date(Date.now());
            const prevDate = new Date(currDate);
            prevDate.setFullYear(prevDate.getFullYear() - 1);
            filter.date = { $gte: prevDate, $lte: currDate }
        } else if (period === 'custom') {
            filter.date = { $gte: startDate, $lte: endDate }
        }

        const sales = await Appointment.find({ serviceProvider: req.userId, ...filter })
            .populate('client')
            .skip((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.ceil((await Appointment.countDocuments({ serviceProvider: req.userId, ...filter })) / limit);

        res.status(200).json({ success: true, sales, totalPages })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}



module.exports = {
    getDashboardData,
    getSalesReport,
}