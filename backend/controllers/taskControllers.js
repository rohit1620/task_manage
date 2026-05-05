
import Task from "../models/taskSchema.js";

const addTask=async(req,res)=>{
    try {
        const { title, description, assignedTo, deadline } = req.body;
         const { role } = req.user;

        if(role!=="manager"){
            return res.status(403).json({"msg":"this is for manager"})
        }
       
        if (!title || !assignedTo) {
            return res.status(400).json({ 
                msg: "Title and AssignedTo (Employee ID) are required" 
            });
        }

        
        const newTask = new Task({
            title,
            description,
            assignedTo, 
            assignedBy: req.user.id, 
            deadline,
            status: 'pending' 
        });

       
        const savedTask = await newTask.save();

    
        res.status(201).json({
            msg: "Task assigned successfully",
            task: savedTask
        });
    } catch (error) {
        res.status(500).json({"msg":"internal error","error":error.message})
    }
}

const getAllTask=async(req,res)=>{
    try {
        const { role, id } = req.user; // Ye data auth middleware (JWT) se aayega
        let query = {};

      
        if (role === 'manager') {
           
            query = { assignedBy: id };
        } else if (role === 'employee') {
            
            query = { assignedTo: id };
        } else if (role === 'admin') {
          
            query = {};
        }

        
        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email') 
            .populate('assignedBy', 'name email') 
            .sort({ createdAt: -1 }); 

        // 3. Response handling
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ msg: "No tasks found" });
        }

        res.status(200).json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({"msg":"internal error","error":error.message})
    }
}

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        const { status } = req.body; 

        
        const validStatuses = ['pending', 'in-progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: "Invalid status value" });
        }

      
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ msg: "Task not found" });
        }

        
        if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ msg: "You are not authorized to update this task's status" });
        }

       
        task.status = status;
        const updatedTask = await task.save();

      
        res.status(200).json({
            msg: `Task status updated to ${status}`,
            task: updatedTask
        });

    } catch (error) {
        res.status(500).json({ 
            "msg": "internal error", 
            "error": error.message 
        });
    }
};



const deleteTask = async (req, res) => {
    try {
        const { id } = req.params; 
        const { id: userId, role } = req.user; // 2. Logged-in user ki details (JWT se)


        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ msg: "Task nahi mila! Shayad pehle hi delete ho gaya ho." });
        }

        
        if (role === 'manager' && task.assignedBy.toString() !== userId) {
            return res.status(403).json({ 
                msg: "Aap sirf apne assign kiye huye tasks hi delete kar sakte hain!" 
            });
        }

       
        if (role === 'employee') {
            return res.status(403).json({ msg: "Employees ko task delete karne ka adhikaar nahi hai." });
        }

        // 5. Sab sahi hai, toh delete kar do
        await Task.findByIdAndDelete(id);

        res.status(200).json({ 
            msg: "Task successfully delete kar diya gaya hai.",
            deletedTaskId: id 
        });

    } catch (error) {
        // 6. Error handling
        res.status(500).json({ 
            "msg": "internal error", 
            "error": error.message 
        });
    }
};



// const updateTask=async(req,res)=>{
//     try {
        
//     } catch (error) {
//         res.status(500).json({"msg":"internal error","error":error.message})
//     }
// }

export {addTask,getAllTask,updateStatus,deleteTask}