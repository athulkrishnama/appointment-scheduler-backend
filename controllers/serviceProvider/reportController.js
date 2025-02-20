const Appointment = require('../../models/appointment');
const PDFDocument = require('pdfkit');
const { table } = require('pdfkit-table');
const User = require('../../models/user');
const fs = require('fs');

const getDashboardData = async (req, res) => {
    try {
        const results = await Appointment.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id": 1 } },
        ]);
        
        const formattedData = {};
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            formattedData[formattedDate] = 0;
        }
        
        results.forEach(({ _id, count }) => {
            const date = new Date(_id);
            const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            formattedData[formattedDate] = count;
        });
        
        res.status(200).json(formattedData);
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}


const getSalesReport = async (req, res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit== 'all'? null : parseInt(req.query.limit) || 5;
        const period = req.query.period || 'week';
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        const status = req.query.status;

        const filter = {}

        if(status){
            filter.status = status;
        }

        if(period === 'daily'){
            const currDate = new Date(Date.now());
            currDate.setHours(0, 0, 0, 0);
            filter.date = {$eq: currDate}
        }else if(period === 'weekly'){
            const currDate = new Date(Date.now());
            const prevDate = new Date(currDate);
            prevDate.setDate(prevDate.getDate() - 7);
            filter.date = {$gte: prevDate, $lte: currDate}
        }else if(period === 'monthly'){
            const currDate = new Date(Date.now());
            const prevDate = new Date(currDate);
            prevDate.setMonth(prevDate.getMonth() - 1);
            filter.date = {$gte: prevDate, $lte: currDate}
        }else if(period === 'yearly'){
            const currDate = new Date(Date.now());
            const prevDate = new Date(currDate);
            prevDate.setFullYear(prevDate.getFullYear() - 1);
            filter.date = {$gte: prevDate, $lte: currDate}
        }else if(period === 'custom'){
            filter.date = {$gte: startDate, $lte: endDate}
        }

        const sales = await Appointment.find({serviceProvider: req.userId, ...filter})
        .populate('client')
        .skip((page - 1) * limit)
        .limit(limit);

        const totalPages = Math.ceil((await Appointment.countDocuments({serviceProvider: req.userId, ...filter})) / limit);

        res.status(200).json({success: true, sales, totalPages})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}



module.exports = {
    getDashboardData,
    getSalesReport,
}