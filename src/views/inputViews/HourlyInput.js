import { useEffect, useRef, useState } from "react";
import { useTableContext } from "../../context";
import { CALC } from "../../helpers";
import { Table } from "react-bootstrap";
import clone from 'just-clone';

const shiftHours = [
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
    "13th",
    "14th",
    "15th",
    "16th",
    "17th",
    "18th",
    "19th",
    "20th",
    "21st",
    "22nd",
    "23rd",
    "24th",
];

//FIX When adding to the hourly input of a subline, it updates the original hash table before updating the DB which makes temp data unchangeable
function HourlyInput({ totalShif, totalHrs, daily, hourInput, subLine, objToUpdate, dataChanged, updateValues }) {
    const [expectedInput, setExpectedInput] = useState([]);

    const { shiftStart, breaks } = useTableContext();

    const hoursInputRef = useRef([]);

    useEffect(() => {
        const totalWorkingHrs = totalShif * totalHrs; // - (CALC.getCurrentHour() - shiftStart)//(today?.hourlyInput?.length > 1 ? today?.hourlyInput?.length : 0)

        const hourlyInput = CALC.calcHourlyData(totalWorkingHrs, daily?.target, breaks, shiftStart);
        setExpectedInput(hourlyInput);
    }, [totalShif, totalHrs, daily, breaks, shiftStart]);

    useEffect(() => {
        //if(hourInput.length < 1) return
        hoursInputRef.current.forEach((item, i) => {
            if (i > expectedInput.length - 1) return;
            item.value = hourInput?.[i]?.value ? hourInput?.[i]?.value : "";
        });
        // eslint-disable-next-line
    }, [expectedInput]);

    function isNAN(value) {
        if (`${value}` === "NaN") return true;
        return false;
    }

    const handleHourInput = (e) => {
        if (!e.target.value || e.target.value === "") return dataChanged(false);
        let sum = 0;
        const hoursArr = [];
        const time = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        time.setHours(time.getHours(), 0, 0, 0);
        console.log(
            "🚀 ~ file: HourlyInput.js:68 ~ hoursInputRef.current?.forEach ~ hoursInputRef.current:",
            hoursInputRef.current
        );
        hoursInputRef.current?.forEach((item) => {
            if (item?.value && item?.value !== "") {
                sum += parseInt(item.value);
                hoursArr.push({
                    value: item.value,
                    timestamp: time.getTime(),
                });
            }
        });

        objToUpdate((prev) => {
            let data
            if (
                navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/iPhone/i)
            ) data = clone(prev)
            else data = structuredClone(prev);
            console.log(data);
            if (subLine) {
                //structuredClone()
                const lines = [...daily.lines]; //structuredClone(daily.lines); //JSON.parse(JSON.stringify(daily.lines)); //[...daily.lines];
                lines[subLine?.id]["hourlyInput"] = hoursArr;
                lines[subLine?.id]["actual"] = sum;

                let totalLines = 0;
                data.lines = lines;
                lines?.forEach((item) => {
                    console.log(item.actual);
                    totalLines += item.actual && !isNAN(item.actual) ? parseInt(item.actual) : 0;
                });

                data.actual = totalLines;
                console.log("🚀 ~ file: AdminInput.js:246 ~ objToUpdate ~ totalLines:", totalLines);
            } else {
                data.hourlyInput = hoursArr;
                data.actual = sum;
            }

            console.log("🚀 ~ file: HourlyInput.js:106 ~ objToUpdate ~ data:", data);
            return data;
        });
        // if (subLine) return updateValues(null, null, null, null, null, null, tempData?.lines);
        updateValues();
    };

    return (
        <>
            <Table responsive striped bordered>
                <thead>
                    <tr colSpan={expectedInput.length}>
                        <td className="theader" colSpan={expectedInput.length}>
                            Daily Target Divided by Shift's Hours
                        </td>
                    </tr>
                    <tr>
                        {shiftHours.slice(0, expectedInput.length).map((slot) => (
                            <td className="theader" key={slot}>
                                {slot} Hour
                            </td>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {expectedInput.map((value, i) => (
                            <td
                                key={shiftHours[i] + i}
                                style={{
                                    color: `${value < hourInput?.[i]?.value ? "green" : value !== 0 ? "red" : "green"}`,
                                }}>
                                {`${value}` === "NaN" ? "" : value}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </Table>

            <Table responsive striped bordered>
                <thead>
                    <tr colSpan={expectedInput.length}>
                        <td className="theader" colSpan={expectedInput.length}>
                            Hourly input
                        </td>
                    </tr>
                    <tr>
                        {shiftHours.slice(0, expectedInput.length).map((slot) => (
                            <td className="theader" key={slot}>
                                {slot} Hour
                            </td>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {shiftHours.slice(0, expectedInput.length).map((slot, i) => (
                            <td key={slot + i}>
                                <input
                                    type="number"
                                    min="0"
                                    max="9999999"
                                    ref={(el) => (hoursInputRef.current[i] = el)}
                                    onWheel={(e) => e.target.blur()}
                                    onChange={(e) => handleHourInput(e, i)}
                                />
                            </td>
                        ))}
                    </tr>
                </tbody>
            </Table>
        </>
    );
}

export default HourlyInput;
