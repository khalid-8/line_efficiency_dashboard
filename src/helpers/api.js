import React from "react";
import { collection, addDoc, getDocs, setDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { axiosInstance } from "./axiosInstance";
import { Notify } from "../components";
// import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";

const handleError = async (err, msg) => {
    //if response status is 401 (unAuthorized) then logout user
    // if (err.response?.status === 401) return logout()
    Notify(msg, true);
};

class API extends React.Component {
    uploadDoc = async (path, data) => {
        try {
            const docRef = await addDoc(collection(db, path), data);
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            Notify(`Error adding document`, true);
            console.error("Error adding document: ", e);
        }
    };

    updateDBDoc = async (path, pathSeg, data) => {
        try {
            await setDoc(doc(db, path, pathSeg), data, { merge: true });
            //update the report
            // axiosInstance.post(
            //     "api/update_report",
            //     {},
            //     {
            //         credentials: "omit",
            //         authorization: `bearer ${sessionStorage.getItem("authToken")}`,
            //     }
            // );
            // Notify("تم رفع البيانات الى قاعدة البيانات", false)
        } catch (err) {
            Notify(`Error updating document`, true);
            console.error("Error adding document: ", err);
        }
    };

    updateDocField = async (path, pathSeg, data) => {
        try {
            await updateDoc(doc(db, path, pathSeg), data);
            //update the report
            // axiosInstance.post(
            //     "api/update_report",
            //     {},
            //     {
            //         credentials: "omit",
            //         authorization: `bearer ${sessionStorage.getItem("authToken")}`,
            //     }
            // );
        } catch (err) {
            Notify(`Error updating document`, true);
            console.error("Error adding document: ", err);
        }
    };

    deleteDocDB = async (path, pathSeg, fileName) => {
        const docRef = doc(db, path, pathSeg);
        await deleteDoc(docRef)
            .then(async () => {
                await this.deleteAllFiles(fileName);
            })
            .catch(async (err) => {
                Notify(`Error adding document: ${fileName}`, true);
                console.error("Error deleteing doc: ", err);
            });
    };

    getAllDocs = async (path) => {
        try {
            const data = [];
            const querySnapshot = await getDocs(collection(db, path));
            querySnapshot.forEach((doc) => {
                data.push(doc.data());
                // console.log(doc.data())
            });
            return data;
        } catch (err) {
            // await handleError(err, "لم نستطع ايجاد البيانات في قاعدة البيانات")
            Notify(`Doc Doesn't Exist`, true);
            throw new Error("Doc Doesn't Exist"); //{ code : 404, message : }
        }
    };

    /*uploadFile = async(path, file) => {
        // Create a reference to 'images/mountains.jpg'
        const storageRef = ref(storage, path);
        try {
            // 'file' comes from the Blob or File API
            const snapshot = await uploadBytes(storageRef, file)
            console.log(snapshot)
            console.log('Uploaded a blob or file!');
            return "https://firebasestorage.googleapis.com/v0/b/samco-srmco-internal-portal.appspot.com/o/" + snapshot.ref._location.path.replaceAll("/", "%2F").replaceAll(" ", "%20") + "?alt=media"
        } catch (e) {
            console.error("Error uploading file: ", e);
        }
    }

    deleteFile = async(path) => {
        // Create a reference to the file to delete
        const storageRef = ref(storage, path);
        try {
             // Delete the file
            await deleteObject(storageRef)
            console.log("File Deleted")
        } catch (err) {
            console.error("Error deleteing file: ", err);
        }
    }*/

    getAllFiles = async () => {
        const folders = await this.getAllDocs("docs");
        console.log(folders);
        const res = await this.addFileUrls("", folders);

        setTimeout(() => {
            res.forEach(async (item) => {
                await this.updateDBDoc("docs", item.name, item);
            });
        }, 5000);
        return res;
    };

    addFileUrls = async (path, folder) => {
        if (!Array.isArray(folder) || !folder.length >= 1) return;
        if (path) path = path + "/";

        folder.forEach(async (item) => {
            if (item.type === "folder") return this.addFileUrls(path + item.name, item.content);
            item["url"] = await this.getFileURL(path + item.name);
            console.log(item);
        });

        console.log(folder);
        return folder;
    };

    getAllUsers = async () => {
        return await axiosInstance
            .get("api/getAll_users", {
                headers: {
                    //withCredentials: true,
                    credentials: "omit",
                    authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                },
            })
            .then((res) => {
                return res.data;
            })
            .catch(async (err) => {
                console.log(err);
                await handleError(err, "we couldn't fetch all the users from the backend");
            });
    };

    approveUser = async (data) => {
        return await axiosInstance
            .put("api/approve_user", data, {
                headers: {
                    //withCredentials: true,
                    // authorization : `${document.cookie.split('=')[1].split(";")[0]}`,
                    credentials: "omit",
                    authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                },
            })
            .then((res) => {
                if (res.status === 200) Notify(`User has been Approved!`);
            })
            .catch(async (err) => {
                await handleError(err, "لم نستطع تعيين صلاحيات المستخدم!");
                // Notify(, true)
            });
    };

    userToAdmin = async (data) => {
        return await axiosInstance
            .put("api/admin", data, {
                headers: {
                    //withCredentials: true,
                    // authorization : `${document.cookie.split('=')[1].split(";")[0]}`,
                    credentials: "omit",
                    authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                    "X-Firebase-AppCheck": sessionStorage.getItem("X-Firebase-AppCheck"),
                },
            })
            .then((res) => {
                if (res.status === 200) Notify(`User is now ${data.admin ? "admin" : "user"}!`);
            })
            .catch(async (err) => {
                await handleError(err, "لم نستطع تعيين صلاحيات المستخدم!");
            });
    };

    makePlanner = async (data) => {
        console.log(data);
        return await axiosInstance
            .put("api/planner", data, {
                headers: {
                    //withCredentials: true,
                    // authorization : `${document.cookie.split('=')[1].split(";")[0]}`,
                    credentials: "omit",
                    authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                },
            })
            .then((res) => {
                if (res.status === 200) Notify(`User is now ${data.planner ? "planner" : "user"}!`);
            })
            .catch(async (err) => {
                await handleError(err, "لم نستطع تعيين صلاحيات المستخدم!");
            });
    };

    makeProduction = async (data) => {
        console.log(data);
        return await axiosInstance
            .put("api/production", data, {
                headers: {
                    //withCredentials: true,
                    // authorization : `${document.cookie.split('=')[1].split(";")[0]}`,
                    credentials: "omit",
                    authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                },
            })
            .then((res) => {
                if (res.status === 200) Notify(`User is now ${data.production ? "production" : "user"}!`);
            })
            .catch(async (err) => {
                await handleError(err, "لم نستطع تعيين صلاحيات المستخدم!");
            });
    };
    deleteUser = async (uid) => {
        return await axiosInstance
            .delete("api/deleteuser", {
                headers: {
                    //withCredentials: true,
                    // authorization : `${document.cookie.split('=')[1].split(";")[0]}`,
                    credentials: "omit",
                    authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                    "X-Firebase-AppCheck": sessionStorage.getItem("X-Firebase-AppCheck"),
                },
                data: { uid: uid },
            })
            .then(async (res) => {
                Notify("User has been Deleted!");
                // await this.deleteStorageFolder(`users/${uid}/`)
                // if (res.status === 204) Notify('User has been Deleted!')
                // else  Notify('لم تحذف بعض بيانات المستخدم', true)
            })
            .catch(async (err) => {
                await handleError(err, "لم نستطع حذف المستخدم!");
            });
    };

    changeUserPass = async (uid, pass) => {
        return await axiosInstance
            .post(
                "api/change_password",
                { uid: uid, newPass: pass },
                {
                    headers: {
                        //withCredentials: true,
                        credentials: "omit",
                        authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                        "X-Firebase-AppCheck": sessionStorage.getItem("X-Firebase-AppCheck"),
                    },
                }
            )
            .then(async (res) => {
                if (res.status === 202) Notify("تم تحديث المستخدم");
            })
            .catch(async (err) => {
                await handleError(err, "لم نستطع تحديث المستخدم!");
            });
    };

    generateReport = async (past, from, to) => {
        return await axiosInstance
            .get("api/generate_report", {
                headers: {
                    //withCredentials: true,
                    // responseType: 'blob',
                    credentials: "omit",
                    authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                },
                params: {
                    past: past,
                    from: from,
                    to: to,
                },
                //past: past, from:from, to:to
            })
            .then(async (res) => {
                console.log(res);
                fetch(`data:application/pdf;base64,${res.data}`)
                    .then((response) => response.blob())
                    .then((blob) => {
                        console.log(blob);
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.setAttribute("download", `report_${new Date().toLocaleString()}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                    })
                    .catch(async (err) => {
                        await handleError(err, "Couldn't download the Report!");
                    });
            })
            .catch(async (err) => {
                await handleError(err, "Couldn't download the Report!");
            });
    };

    sendMail = async (email, line, subject, msg) => {
        return await axiosInstance
            .post(
                "api/send_email",
                { email: email, line: line, subject: subject, msg: msg },
                {
                    headers: {
                        credentials: "omit",
                        authorization: `bearer ${sessionStorage.getItem("authToken")}`,
                    },
                }
            )
            .then(() => {
                Notify(`Emails was sent successfully`, false);
            })
            .catch(async (err) => {
                await handleError(err, `Couldn't send warning emails`);
            });
    };
}

const instance = new API();
export default instance;
