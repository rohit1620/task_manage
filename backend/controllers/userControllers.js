const User = require('../models/User');

const getAllEmployees = async (req, res) => {
    try {
       
        const { id, role } = req.user;
        
        let query = {};

     
         if (role === 'manager') {
        
            query = { role: 'employee', managerId: id };
        } else {
        
            return res.status(403).json({ msg: "Employees cannot view employee lists" });
        }

        
        const employees = await User.find(query).select('-password').sort({ createdAt: -1 });

     
        res.status(200).json({
            success: true,
            count: employees.length,
            employees
        });

    } catch (error) {
        res.status(500).json({ 
            "msg": "internal error", 
            "error": error.message 
        });
    }
};

const User = require('../models/User');

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; 
        const currentUser= req.user; 

    
        const employeeToDelete = await User.findById(id);

        if (!employeeToDelete) {
            return res.status(404).json({ msg: "User nahi mila!" });
        }

        if (currentUser.role !== 'manager') {
            return res.status(403).json({ msg: "Sirf Manager hi employee delete kar sakta hai!" });
        }

        
        if (currentUser.role === 'manager' && employeeToDelete.managerId.toString() !== currentUser.id) {
            return res.status(403).json({ 
                msg: "Aap kisi dusre manager ke employee ko delete nahi kar sakte!" 
            });
        }

        // Agar upar ke dono check pass ho gaye, toh delete kar do
        await User.findByIdAndDelete(id);

        res.status(200).json({ 
            success: true,
            msg: "Employee ko successfully remove kar diya gaya hai." 
        });

    } catch (error) {
        res.status(500).json({ 
            "msg": "internal error", 
            "error": error.message 
        });
    }
};
// const resetPassword=async(req,res)=>{
//     try {
        
//     } catch (error) {
//         res.status(500).json({"msg":"internal error","error":error.message})
//     }
// }

export {getAllEmployees,deleteUser}