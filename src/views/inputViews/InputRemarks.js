import React from "react";
import { useRef, useState, useEffect } from "react";
import { useConfirmationContext, useTableContext } from "../../context";
import { API } from "../../helpers";
import { Table, Form, Card, Button } from "react-bootstrap";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import classify from "../../components/issuesClassifications.json";
import { addHours } from "date-fns";
import { Notify, getRemarkTag } from "../../components";
import clone from 'just-clone';

const getDelayIdx = (cause) => {
    let tag
    switch (cause) {
        case "material":
            tag = 0
            break;
        case "manpower":
            tag = 1
            break;
        case "equipment":
            tag = 2
            break;
        case "method":
            tag = 3
            break;
        case "other":
        case "others":
            tag = 4
            break;
        default:
            tag = 5
            break;
    }
    return tag;
}

export default function DisplayInputRemarks({
    remarks,
    lineId,
    pastDate,
    daily,
    isAdmin,
    objToUpdate,
    updateValues,
    sendEmail,
    subLine,
}) {
    const [editingRemark, setEditingRemarks] = useState(false);

    const { showConfirmationAlert } = useConfirmationContext();

    return (
        <>
            {Array.isArray(remarks) && remarks.length > 0 && (
                <>
                <div> 
                    <p style={{paddingBottom: "0", marginBottom: "0", fontWeight: "bold"}}>
                        Delay Causes:
                    </p>
                    {getRemarkTag("manpower", {fontSize: "12px", marginRight: "3px"})}
                    {getRemarkTag("material", {fontSize: "12px", marginRight: "3px"})}
                    {getRemarkTag("equipment", {fontSize: "12px", marginRight: "3px"})}
                    {getRemarkTag("method", {fontSize: "12px", marginRight: "3px"})}
                    {getRemarkTag("other", {fontSize: "12px", marginRight: "3px"})}
                    {getRemarkTag("pcomment", {fontSize: "12px"})}
                    
                </div>
                <Table responsive striped bordered className="mt-3 remarks-table-body">
                    <thead>
                        <tr>
                            <th>TIME</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {remarks?.map((item, i) => (
                            <tr key={JSON.stringify(item) + `${i}`} style={{background: `${classify?.issues[getDelayIdx(item.cause)].bg}`}}>
                                <td style={{ minWidth: "150px" }}>
                                    <b>
                                        {item.from} - {item.to}
                                    </b>
                                </td>
                                <td className="remarks-text-area" style={{ position: "relative" }}>
                                    {item.text}

                                    {isAdmin && (
                                        <>
                                            <AiFillDelete
                                                className="delete_remark"
                                                onClick={async () => {
                                                    const result = await showConfirmationAlert({
                                                        head: `Delete Remark!`,
                                                        body: `are you sure you want to delete this remark?`,
                                                    });
                                                    if (result) {
                                                        const newRemarks = [...remarks];
                                                        newRemarks.splice(i, 1);
                                                        const time = new Date(
                                                            pastDate ??
                                                                new Date().toLocaleString("en-US", {
                                                                    timeZone: "Asia/Riyadh",
                                                                })
                                                        );
                                                        time.setHours(0, 0, 0, 0);
                                                        console.log(`${lineId}/production/${time.getTime()}`);
                                                        if (subLine){
                                                            try {
                                                                const newLines = [...daily.lines]                                                                
                                                                const newSubRemarks = newLines?.[subLine.id].remarks
                                                                const idx = newSubRemarks.findIndex(cur => JSON.stringify(cur) === JSON.stringify(item));
                                                                newSubRemarks.splice(idx, 1);
    
                                                                newLines[subLine.id].newSubRemarks = newSubRemarks

                                                                await API.updateDocField(
                                                                    "data",
                                                                    `${lineId}/production/${time.getTime()}`,
                                                                    { remarks: newRemarks, lines: newLines}
                                                                );

                                                            } catch (error) {
                                                                console.log(error)
                                                                Notify("couldn't delete Remark", true)
                                                            }
                                                        }else{
                                                            await API.updateDocField(
                                                                "data",
                                                                `${lineId}/production/${time.getTime()}`,
                                                                { remarks: newRemarks }
                                                            );
                                                        }
                                                    }
                                                }}
                                            />
                                            <AiFillEdit className="edit_remark" onClick={() => setEditingRemarks(i)} />
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                </>
            )}

            <InputRemarks
                remarks={remarks}
                editingRemark={editingRemark}
                lineId={lineId}
                daily={daily}
                pastDate={pastDate}
                setEditingRemarks={setEditingRemarks}
                objToUpdate={objToUpdate}
                updateValues={updateValues}
                sendEmail={sendEmail}
                subLine={subLine}
            />
        </>
    );
}

const catgsMap = new Map();

export function InputRemarks({
    remarks,
    editingRemark,
    lineId,
    daily,
    pastDate,
    setEditingRemarks,
    objToUpdate,
    updateValues,
    sendEmail,
    subLine,
}) {
    const [cantSubmitEditedRemarks, setCantSubmitEditingRemarks] = useState(true);
    const { shiftStart } = useTableContext();

    const remarksText = useRef();
    const remarksFrom = useRef();
    const remarksTo = useRef();
    const remarksReason = useRef();

    useEffect(() => {
        console.log(editingRemark)
    }, [editingRemark])
    useEffect(() => {
        classify?.issues.forEach((item) => {
            catgsMap.set(item.id, item);
        })
    }, [])
    
    useEffect(() => {
        if (remarksReason.current?.value) remarksReason.current.value = "false";
        if (remarksFrom.current?.value) remarksFrom.current.value = "";
        if (remarksTo.current?.value) remarksTo.current.value = "";
        if (remarksText.current?.value) remarksText.current.value = "";
    }, [remarks]);

    const handleRmarksInput = async() => {
        let cause = catgsMap.get(remarksReason.current.options[remarksReason.current.options.selectedIndex].parentNode.id)
        //setRemarks(e.target.value)
        // const causeIdx = classify.issues.findIndex(
        //     (item) =>
        //         item.id === remarksReason.current.options[remarksReason.current.options.selectedIndex].parentNode.id
        // );
        let subCauseIdx;
        // if (causeIdx !== -1) {
        //     mainCause = classify.issues[causeIdx].id;
        //     subCauseIdx = classify.issues[causeIdx].sub.findIndex((item) => item.id === remarksReason.current?.value);
        // } else mainCause = remarksReason.current?.value;

        if (cause) {
            subCauseIdx = cause.sub.findIndex((item) => item.id === remarksReason.current?.value);
        } else {
            cause = catgsMap.get(remarksReason.current?.value);
            subCauseIdx = -1
        }

        const remarksObj = {
            cause: cause.id,
            from: remarksFrom.current?.value,
            to: remarksTo.current?.value,
            text: remarksText.current?.value,
            emails:
                cause && subCauseIdx !== -1
                    ? cause.sub[subCauseIdx]?.emails
                    : cause?.emails,
        };

        if (subCauseIdx !== -1) remarksObj["subCause"] = remarksReason.current?.value;
        if (subLine) {
            remarksObj["sub"] = true;
            remarksObj["product"] = {
                name: subLine?.name,
                color: subLine?.color,
            };
        }

        const arr = remarks ? ( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i) ? clone(remarks) : structuredClone(remarks)) : [];

        arr.push(remarksObj);

        objToUpdate((prev) => {
            let data
            if (
                navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/iPhone/i)
            ) data = clone(prev)
            else data = structuredClone(prev);

            if (subLine) {
                const lines = [...daily.lines]; //? [...daily.lines] : [{}, {}, {}];
                lines[subLine?.id]["remarks"] = arr;
                data.lines = lines;
                const lineRemarks = daily?.lineRemarks ? [...daily?.lineRemarks] : [];
                // lineRemarks.push(remarksObj);
                data.remarks = lineRemarks.concat(arr);
                // data.remarks = lineRemarks;
            } else data.remarks = arr;

            return data;
        });

        if (cause.notify !== false){
            sendEmail(true);
        }

        updateValues();
    };

    const onInputChange = async(edit = false) => {
        if (remarksReason.current?.value === "false") return remarksReason.current.classList.add("is-invalid");
        else remarksReason.current.classList.remove("is-invalid");
        //if the remarks is not all day user need to specify time otherwise no need for the from-to properties, because it will be all day
        let category = await catgsMap.get(remarksReason.current.value)

        if (!category?.allDay){
            if (!remarksFrom.current?.value || remarksFrom.current?.value === "")
                return remarksFrom.current.classList.add("is-invalid");
            else remarksFrom.current.classList.remove("is-invalid");
            if (remarksFrom.current?.value > remarksTo.current?.value) return remarksTo.current.classList.add("is-invalid");
            else remarksTo.current.classList.remove("is-invalid");
        }else{
            const date = new Date()
            date.setHours(parseInt(shiftStart), 0,0,0)
            remarksFrom.current.value = date.toTimeString().split(" ")[0].slice(0,5) //date.getTime()
            date.setHours(parseInt(shiftStart), 0,0,0)
            const shiftEnd = addHours(date, daily?.totalHrs)
            remarksTo.current.value = shiftEnd.toTimeString().split(" ")[0].slice(0,5)//.getTime()
            remarksFrom.current.classList.remove("is-invalid");
            remarksTo.current.classList.remove("is-invalid");
        }
        if (!remarksText.current?.value || remarksText.current?.value === "")
            return remarksText.current.classList.add("is-invalid");
        remarksText.current.classList.remove("is-invalid");
        if (!edit) return handleRmarksInput();
        return setCantSubmitEditingRemarks(false);
    };

    return (
        <>
            {editingRemark !== false && (
                <div className="blurBG">
                    <Card style={{ width: "80%", padding: "10px" }}>
                        <Form.Group
                            className="mb-4 mt-3"
                            controlId="exampleForm.ControlTextarea1"
                            onChange={() => onInputChange(true)}>
                            <Form.Label
                                className="mb-4"
                                style={{
                                    fontWeight: "bold",
                                    color: "red",
                                    textAlign: "center",
                                }}>
                                Remarks
                            </Form.Label>
                            <div className="remarks-options mb-2">
                                <Form.Select
                                    aria-label="Default select example"
                                    ref={remarksReason}
                                    defaultValue={remarks?.[editingRemark]?.cause}>
                                    <option key="blankChoice" hidden value={false}>
                                        Classify the Remark Topic
                                    </option>
                                    {classify.issues.map((item) => (
                                        <>
                                            {!item.subMenu ? (
                                                <option value={item.id}>{item.cause}</option>
                                            ) : (
                                                <optgroup id={item.id} label={item.cause}>
                                                    {item.sub.map((sub) => (
                                                        <option value={sub.id}>{sub.cause}</option>
                                                    ))}
                                                </optgroup>
                                            )}
                                        </>
                                    ))}
                                </Form.Select>
                                <div className="d-flex justify-content-center justify-items-center align-items-center">
                                    <span
                                        className="d-flex justify-content-center align-items-center"
                                        style={{ marginRight: "10px" }}>
                                        <b style={{ paddingRight: "10px" }}>From</b>
                                        <Form.Control
                                            type="time"
                                            ref={remarksFrom}
                                            defaultValue={remarks?.[editingRemark]?.from}
                                        />
                                    </span>
                                    <span className="d-flex justify-content-center align-items-center">
                                        <b style={{ paddingRight: "10px" }}>To</b>
                                        <Form.Control
                                            type="time"
                                            min={remarksFrom.current?.value}
                                            ref={remarksTo}
                                            defaultValue={remarks?.[editingRemark]?.to}
                                        />
                                    </span>
                                </div>
                            </div>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                ref={remarksText}
                                defaultValue={remarks?.[editingRemark]?.text}
                            />
                        </Form.Group>
                        <div
                            className="d-flex w-100 justify-content-center align-items-center"
                            style={{ columnGap: "15px" }}>
                            <Button
                                disabled={cantSubmitEditedRemarks}
                                className="custom-btn"
                                onClick={async () => {
                                    const newRemarks = [...remarks];
                                    newRemarks[editingRemark] = {
                                        cause: remarksReason.current?.value,
                                        from: remarksFrom.current?.value,
                                        to: remarksTo.current?.value,
                                        text: remarksText.current?.value,
                                    };
                                    console.log(pastDate);
                                    const time = new Date(
                                        pastDate ??
                                            new Date().toLocaleString("en-US", {
                                                timeZone: "Asia/Riyadh",
                                            })
                                    );
                                    console.log(time);
                                    time.setHours(0, 0, 0, 0);

                                    console.log(`${lineId}/production/${time.getTime()}`);
                                    if (subLine) {
                                        const lines = structuredClone(daily.lines);
                                        lines[subLine?.id].remarks = newRemarks;
                                        await API.updateDocField("data", `${lineId}/production/${time.getTime()}`, {
                                            lines: lines,
                                        });
                                    } else {
                                        await API.updateDocField("data", `${lineId}/production/${time.getTime()}`, {
                                            remarks: newRemarks,
                                        });
                                    }
                                    //setRemarks(newRemarks)
                                    setEditingRemarks(false);
                                }}>
                                Update
                            </Button>
                            <Button onClick={() => setEditingRemarks(false)} variant="danger">
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <Form.Group className="mb-4 mt-3" controlId="exampleForm.ControlTextarea1" onChange={() => onInputChange()}>
                <Form.Label
                    className="mb-4 mt-3"
                    style={{
                        fontWeight: "bold",
                        color: "red",
                        textAlign: "center",
                    }}>
                    Remarks
                </Form.Label>
                <div className="remarks-options mb-2">
                    <Form.Select aria-label="Default select" ref={remarksReason}>
                        <option key="blankChoice" hidden value={false}>
                            Classify the Remark Topic
                        </option>
                        {classify.issues.map((item) => (
                            <>
                                {!item.subMenu ? (
                                    <option value={item.id}>{item.cause}</option>
                                ) : (
                                    <optgroup id={item.id} label={item.cause}>
                                        {item.sub.map((sub) => (
                                            <option value={sub.id}>{sub.cause}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </>
                        ))}
                    </Form.Select>
                    <div className="d-flex justify-content-center justify-items-center align-items-center">
                        <span
                            className="d-flex justify-content-center align-items-center"
                            style={{ marginRight: "10px" }}>
                            <b style={{ paddingRight: "10px" }}>From</b>
                            <Form.Control type="time" ref={remarksFrom} />
                        </span>
                        <span className="d-flex justify-content-center align-items-center">
                            <b style={{ paddingRight: "10px" }}>To</b>
                            <Form.Control type="time" min={remarksFrom.current?.value} ref={remarksTo} />
                        </span>
                    </div>
                </div>

                <Form.Control as="textarea" rows={3} ref={remarksText} />
            </Form.Group>
        </>
    );
}

/*
    <div style={{position: "absolute", width: "200px", height: "90px", top: "0", bottom: "0", left: "0", right: "0", margin: "auto", opacity: "1", zIndex: "0", scale: "1.5"}}>
        {getRemarkTag(item.cause)}
    </div>
*/