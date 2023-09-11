import React from "react";
import { Card, Table } from "react-bootstrap";
import { TargetGraph } from "../components";
import { AiOutlineClose } from "react-icons/ai";
import "./styles/remarks.css";
import { getRemarkTag } from "../components";

export default function Remarks({ name, line, period, showFullRemarks }) {
    let remeraksArr = [];

    if ((period === "monthly" || period === "weekly" || period === "lastWeek") && line?.remarks.length > 0) {
        for (let idx in line.remarks) {
            console.log(idx);
            if (!line.remarks[idx].text) continue;
            remeraksArr.push({
                date: `${new Date(line.remarks[idx]?.time).toLocaleString("en-GB", {
                    timeZone: "Asia/Riyadh",
                    weekday: "long",
                })}, ${
                    new Date(line.remarks[idx]?.time).toLocaleString("en-GB", { timeZone: "Asia/Riyadh" }).split(",")[0]
                }`,
                remarks: line.remarks[idx]?.text,
            });
        }
    }

    if (period === "daily" && line?.remarks) {
        remeraksArr.push({
            date: `${new Date(line?.timestamp).toLocaleString("en-GB", {
                timeZone: "Asia/Riyadh",
                weekday: "long",
            })}, ${new Date(line?.timestamp).toLocaleString("en-GB", { timeZone: "Asia/Riyadh" }).split(",")[0]}`,
            remarks: line?.remarks,
        });
    }

    if (!remeraksArr || remeraksArr.length < 1) return;

    return (
        <div className="remarksBG">
            <Card className="remarks_content">
                <AiOutlineClose className="close_remarks" onClick={() => showFullRemarks(false)} />

                <h3>{name}</h3>

                <span className="remarks_eff">
                    <TargetGraph target={line?.target} actual={line?.actual} eff={line?.eff} title={``} />
                </span>

                <Table responsive striped bordered className="mt-3 remarks-table-body">
                    <thead>
                        <tr>
                            <th>date</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {remeraksArr.map((item) => (
                            <tr>
                                <td>
                                    <b>{item.date}</b>
                                </td>
                                <td className="remarks-text-area">
                                    {Array.isArray(item.remarks) && item.remarks.length > 0 ? (
                                        item.remarks?.map((remark) => (
                                            <div>
                                                <b>
                                                    {remark.from} - {remark.to}
                                                    <div>
                                                        {getRemarkTag(remark.cause)}
                                                        {remark?.sub && (
                                                            <span
                                                                className="subline_tag"
                                                                style={{ background: `${remark?.product?.color}` }}>
                                                                {remark?.product?.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </b>
                                                
                                                <p>{remark.text}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>{item.remarks}</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
