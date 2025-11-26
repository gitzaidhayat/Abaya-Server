const User = require('../models/user.model');

// Get all addresses for a user
async function getAddresses(req, res) {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      addresses: user.addresses || []
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      message: "Failed to fetch addresses"
    });
  }
}

// Add new address
async function addAddress(req, res) {
  try {
    const { fullName, phone, address, locality, city, state, zipCode, country, landmark, alternatePhone, addressType, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      fullName,
      phone,
      address,
      locality,
      city,
      state,
      zipCode,
      country,
      landmark,
      alternatePhone,
      addressType: addressType || 'home',
      isDefault: isDefault || false
    });

    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      address: user.addresses[user.addresses.length - 1]
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      message: "Failed to add address"
    });
  }
}

// Update address
async function updateAddress(req, res) {
  try {
    const { addressId } = req.params;
    const { fullName, phone, address, locality, city, state, zipCode, country, landmark, alternatePhone, addressType, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        message: "Address not found"
      });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex]._doc,
      fullName,
      phone,
      address,
      locality,
      city,
      state,
      zipCode,
      country,
      landmark,
      alternatePhone,
      addressType: addressType || user.addresses[addressIndex].addressType,
      isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault
    };

    await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      address: user.addresses[addressIndex]
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      message: "Failed to update address"
    });
  }
}

// Delete address
async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        message: "Address not found"
      });
    }

    // Remove address
    user.addresses.splice(addressIndex, 1);
    
    await user.save();

    res.status(200).json({
      message: "Address deleted successfully"
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      message: "Failed to delete address"
    });
  }
}

// Set default address
async function setDefaultAddress(req, res) {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        message: "Address not found"
      });
    }

    // Remove default from all addresses
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
    user.addresses[addressIndex].isDefault = true;
    
    await user.save();

    res.status(200).json({
      message: "Default address updated successfully",
      address: user.addresses[addressIndex]
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      message: "Failed to set default address"
    });
  }
}

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
