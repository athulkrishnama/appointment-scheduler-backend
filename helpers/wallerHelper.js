const Wallet = require("../models/wallet");
const Transaction = require("../models/transactions");

const addAmountToWallet = async (userId, amount, transactionType, appointmentId) => {
    try {

        const transaction = await Transaction.create({
            amount,
            type: 'credit',
            transactionType,
            appointment: appointmentId
        })

        if(!transaction){
            throw new Error("Failed to create transaction")
        }

        const wallet = await Wallet.findOne({userId: userId});
        if (!wallet) {
            const newWallet = await Wallet.create({
                userId,
                transactions: [transaction._id],
                balance: amount
            })
            if(!newWallet){
                throw new Error("Failed to create wallet")
            }
            return true
        }
        wallet.transactions.push(transaction._id);
        wallet.balance += amount;
        await wallet.save();
        return true
    } catch (error) {
        console.log(error)
        throw new Error("Failed to add amount to wallet")
    }
}

module.exports = {addAmountToWallet}