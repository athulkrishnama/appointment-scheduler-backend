const Address = require("../../models/address.js");

const addAddress = async (req, res) => {
  try {
    const { name: fullName, area, district, state, pincode } = req.body;
    const addressData = {
      fullName,
      area,
      district,
      state,
      pincode,
      client: req.userId,
    };
    const address = new Address(addressData);
    await address.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Address added successfully",
        address: address,
      });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ client: req.userId });
    res.status(200).json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const editAddress = async (req, res) => {
  try {
    const { name: fullName, area, district, state, pincode, _id } = req.body;
    const address = await Address.findById(_id);
    if(!address) return res.status(404).json({ success: false, message: "Address not found" })
    if(address.client.toString() !== req.userId) return res.status(404).json({ success: false, message: "Address not found" })
    address.fullName = fullName;
    address.area = area;
    address.district = district;
    address.state = state;
    address.pincode = pincode;
    await address.save();
    res.status(200).json({ success: true, message: "Address updated successfully", address });
  } catch (err) {
    console.error(err)
    res.status(500).json({success:false, message: err.message });
  }
};

module.exports = {
  addAddress,
  getAddresses,
  editAddress
};
