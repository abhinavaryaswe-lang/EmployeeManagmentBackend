const users = require("../models/usersSchema");
const moment = require("moment");
const csv = require("fast-csv");

// register user
exports.userpost = async (req, res) => {
    const { fname, lname, email, mobile, gender, location, status } = req.body;

    if (!fname || !lname || !email || !mobile || !gender || !location || !status) {
        res.status(401).json("All Inputs is required")
    }

    try {
        const preuser = await users.findOne({ email: email });

        if (preuser) {
            res.status(401).json("This user already exist in our databse")
        } else {
            const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

            const userData = new users({
                fname, lname, email, mobile, gender, location, status, datecreated
            });
            await userData.save();
            res.status(200).json(userData);
        }
    } catch (error) {
        res.status(401).json(error);
        console.log("catch block error")
    }
};


// usersget
exports.userget = async (req, res) => {

    const search = req.query.search || ""
    const gender = req.query.gender || ""
    const status = req.query.status || ""
    const sort = req.query.sort || ""
    const page = req.query.page || 1
    const ITEM_PER_PAGE = 4;


    const query = {
        fname: { $regex: search, $options: "i" }
    }

    if (gender !== "All") {
        query.gender = gender
    }

    if (status !== "All") {
        query.status = status
    }

    try {

        const skip = (page - 1) * ITEM_PER_PAGE  // 1 * 4 = 4

        const count = await users.countDocuments(query);

        const usersdata = await users.find(query)
            .sort({ datecreated: sort == "new" ? -1 : 1 })
            .limit(ITEM_PER_PAGE)
            .skip(skip);

        const pageCount = Math.ceil(count/ITEM_PER_PAGE);  // 8 /4 = 2

        res.status(200).json({
            Pagination:{
                count,pageCount
            },
            usersdata
        })
    } catch (error) {
        res.status(401).json(error)
    }
}

// single user get
exports.singleuserget = async (req, res) => {

    const { id } = req.params;

    try {
        const userdata = await users.findOne({ _id: id });
        res.status(200).json(userdata)
    } catch (error) {
        res.status(401).json(error)
    }
}

// user edit
exports.useredit = async (req, res) => {
    const { id } = req.params;
    const { fname, lname, email, mobile, gender, location, status } = req.body;

    const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

    try {
        const updateuser = await users.findByIdAndUpdate({ _id: id }, {
            fname, lname, email, mobile, gender, location, status, dateUpdated
        }, {
            new: true
        });

        await updateuser.save();
        res.status(200).json(updateuser);
    } catch (error) {
        res.status(401).json(error)
    }
}

// delete user
exports.userdelete = async (req, res) => {
    const { id } = req.params;
    try {
        const deletuser = await users.findByIdAndDelete({ _id: id });
        res.status(200).json(deletuser);
    } catch (error) {
        res.status(401).json(error)
    }
}

// chnage status
exports.userstatus = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        const userstatusupdate = await users.findByIdAndUpdate({ _id: id }, { status: data }, { new: true });
        res.status(200).json(userstatusupdate)
    } catch (error) {
        res.status(401).json(error)
    }
}

// export user
exports.userExport = async (req, res) => {
    try {
        const usersdata = await users.find().lean();
        const headers = [
            "FirstName",
            "LastName",
            "Email",
            "Phone",
            "Gender",
            "Status",
            "Location",
            "DateCreated",
            "DateUpdated",
        ];
        const csvContent = await new Promise((resolve, reject) => {
            const csvStream = csv.format({ headers, alwaysWriteHeaders: true, writeBOM: true });
            const chunks = [];

            csvStream.on("data", (chunk) => chunks.push(chunk));
            csvStream.on("error", reject);
            csvStream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));

            usersdata.forEach((user) => {
                csvStream.write({
                    FirstName: user.fname || "-",
                    LastName: user.lname || "-",
                    Email: user.email || "-",
                    Phone: user.mobile || "-",
                    Gender: user.gender || "-",
                    Status: user.status || "-",
                    Location: user.location || "-",
                    DateCreated: user.datecreated || "-",
                    DateUpdated: user.dateUpdated || "-",
                });
            });

            csvStream.end();
        });

        res
            .status(200)
            .set("Content-Type", "text/csv; charset=utf-8")
            .set("Content-Disposition", 'attachment; filename="users.csv"')
            .send(csvContent);
    } catch (error) {
        res.status(500).json({ message: "Could not export users to CSV" });
    }
}
