import React from "react";
import html2pdf from "html2pdf.js";

function isNAN(value) {
    if (`${value}` === "NaN") return true;
    return false;
}

class CALC extends React.Component {
    round = (value, precision) => {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    };

    calcValues = (target, actual) => {
        // setGapValue(`${(valuesRef.current[3].value/valuesRef.current[2].value) * 100}%`)
        const gap = `${target - actual < 0 ? "--" : Math.round(target - actual)}`;
        const eff = `${this.round((actual / target) * 100, 1)}%`;

        return [gap, eff];
    };

    getValues = (data, todays = false, pasteDate = null, multi = false, parent = null) => {
        console.log("🚀 ~ file: prdouctionCalc.js:24 ~ CALC ~ todays:", todays);
        // console.log("🚀 ~ file: prdouctionCalc.js:19 ~ CALC ~ multi:", multi);
        console.log("🚀 ~ file: prdouctionCalc.js:19 ~ CALC ~ parent:", parent);
        console.log("🚀 ~ file: prdouctionCalc.js:19 ~ CALC ~ data:", data);
        // console.log("🚀 ~ file: prdouctionCalc.js:19 ~ CALC ~ Is Lines:", data?.lines);
        const dataToReturn = {
            dailyTarget: data.dailyTarget ? data.dailyTarget : "0",
            weeklyTarget: data.weeklyTarget ? data.weeklyTarget : "0",
            monthlyTarget: data.monthlyTarget ? data.monthlyTarget : "0",
            actual: data.actual ? data.actual : "0",
            totalShifts: data.totalShifts ? data.totalShifts : "1",
            totalHrs: data.totalHrs ? data.totalHrs : "8",
            manpower: data?.manpower ? data?.manpower : { plan: "0", abs: "0", actual: "0" },
            remarks: data?.remarks ?? [],
            hourlyInput: data?.hourlyInput ? data?.hourlyInput : [],
            name: data?.name ? data?.name : "",
            actualTarget: data?.actualTarget ? data?.actualTarget : "0",
            lineId: data?.lineId ?? "",
            timestamp: data?.timestamp
                ? data?.timestamp
                : new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })).getTime(),
        };

        if (multi) {
            const lines =
                parent?.lines?.map((item) => {
                    console.log("🚀 ~ file: prdouctionCalc.js:42 ~ CALC ~ parent?.lines?.map ~ item:", item);
                    if (!todays) {
                        delete item?.actualTarget;
                        delete item?.remarks;
                        delete item?.hourlyInput;
                        item.actual = "0";
                        return item;
                    }
                    return item;
                }) ??
                Array.from(["0", "1", "2"]).map((item) => {
                    return {
                        id: item,
                        dailyTarget: "0",
                        weeklyTarget: "0",
                        monthlyTarget: "0",
                    };
                });
            dataToReturn.lines = lines;
            console.log("🚀 ~ file: prdouctionCalc.js:59 ~ CALC ~ lines:", lines);
            dataToReturn.totalShifts = parent.totalShifts ?? "1";
            dataToReturn.totalHrs = parent.totalHrs ?? "8";
            dataToReturn.manpower = parent?.manpower ? parent?.manpower : { plan: "0", abs: "0", actual: "0" };
            dataToReturn.lineRemarks = parent?.remarks ? parent?.remarks : [];
            // dataToReturn.remarks = parent?.remarks ? parent?.remarks : [];
        }

        if (!todays) {
            delete dataToReturn?.actualTarget;
            delete dataToReturn?.hourlyInput;
            delete dataToReturn?.remarks;
            delete dataToReturn?.manpower;
            delete dataToReturn?.hourlyInput;
            delete dataToReturn?.lineRemarks 
            dataToReturn.actual = "0";
        }
        return dataToReturn;
    };

    getStartOfWeek = (today, previews = null) => {
        //used to determin weither to get this week or last week data
        const baseDate = previews ? previews : today;

        //get the first day of the month or it's sunday
        const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);

        //if the first day of the month is today's date just reutn
        if (
            baseDate.getTime() === firstDay.getTime() ||
            (baseDate.getDay() === 0 && baseDate.getTime() <= firstDay.getTime())
        )
            return firstDay;

        //get the first day of the week
        const startDay = new Date(baseDate.getTime()); //today.getFullYear(), today.getMonth()+1, 1 new Date(new Date().toLocaleString('en-US', {timeZone: "Asia/Riyadh"}))
        startDay.setDate(baseDate.getDate() - baseDate.getDay()); //startDay.setDate(startDay.getDate() + (startDay.getDay() - 7) % 7);

        //if the first day of the week is in last month, return the first day of the month
        if (firstDay.getTime() > startDay.getTime()) return firstDay;
        return startDay;
    };

    getTheEndOfTheWeek = (startOfWeek) => {
        //get the last day of the week (sunday)
        const endOfWeek = new Date(startOfWeek.getTime());
        endOfWeek.setDate(endOfWeek.getDate() + ((0 - 1 - endOfWeek.getDay() + 7) % 7) + 1);

        //get the last day of the month
        const endOfMonth = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth() + 1, 0);

        //if the month ends before sunday just return the last day of the month
        if (endOfWeek.getTime() >= endOfMonth.getTime()) return endOfMonth;
        return endOfWeek;
    };

    getTodaysValues = (dayData, pastDate = null, subLine = null, input = false) => {
        // console.log("🚀 ~ file: prdouctionCalc.js:121 ~ CALC ~ subLine:", subLine);
        if (!dayData || dayData?.length < 1) {
            if (subLine)
                return {
                    target: "0",
                    actual: "0",
                    gap: "0",
                    eff: "0",
                    monthlyTarget: "0",
                    weeklyTarget: "0",
                    lines: [],
                };
            return { target: "0", actual: "0", gap: "0", eff: "0", monthlyTarget: "0", weeklyTarget: "0" };
        }

        let today, idx;
        if (pastDate) today = new Date(new Date(pastDate).toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        else today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        today.setHours(0, 0, 0, 0);

        if (pastDate) {
            idx = dayData.findIndex((item) => item.timestamp === today.getTime());
        }

        if (!pastDate || idx === -1) idx = 0;

        let data;
        if (subLine && input) {
            data = dayData?.[idx]?.lines?.[subLine.id] ?? {};
        } else data = dayData[idx];

        const isTodaysData = dayData[idx].timestamp === today.getTime();
        console.log("🚀 ~ file: prdouctionCalc.js:146 ~ CALC ~ isTodaysData:", isTodaysData);

        console.log("🚀 ~ file: prdouctionCalc.js:132 ~ CALC ~ today:", today.getTime());
        console.log("🚀 ~ file: prdouctionCalc.js:149 ~ CALC ~ today:", today);
        console.log(dayData[idx].timestamp);
        console.log("🚀 ~ file: prdouctionCalc.js:150 ~ CALC ~ index:", idx);
        console.log("🚀 ~ file: prdouctionCalc.js:136 ~ CALC ~ pastDate:", pastDate);

        const todaysData = this.getValues(data, isTodaysData, pastDate, subLine, dayData[idx]);

        const { actual, dailyTarget, hourlyInput, lines, monthlyTarget, weeklyTarget, ...newObj } = dayData[idx];

        const calculated = this.calcValues(todaysData.actualTarget ? (parseInt(todaysData.actualTarget) > todaysData.dailyTarget? todaysData.actualTarget : todaysData.dailyTarget) : todaysData.dailyTarget, todaysData.actual);

        return {
            gap: calculated[0],
            eff: calculated[1],
            target: todaysData.dailyTarget,
            // ...todaysData,
            ...todaysData,
        };
    };

    getLastWeekValues = (weekData, pastDate = null, subLine = null, input = false) => {
        if (!weekData || weekData?.length < 1) return { target: "0", actual: "0", gap: "0", eff: "0" };

        let today;
        if (pastDate) today = new Date(new Date(pastDate).toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        else today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        today.setHours(0, 0, 0, 0);

        const previewsWeek = new Date(today.getTime());
        previewsWeek.setDate(previewsWeek.getDate() - previewsWeek.getDay() - 1);

        const firstday = this.getStartOfWeek(today, previewsWeek);
        const lastday = this.getTheEndOfTheWeek(firstday);

        // console.log(`
        // Previews Week:
        // First Day: ${firstday}
        // Last Day: ${lastday}
        // `)

        let actual = 0;
        let target;
        let remarks = [];
        for (const value of weekData.entries()) {
            if (value[1].timestamp >= lastday.getTime()) continue;
            if (value[1].timestamp < firstday.getTime()) {
                // target = weekData[index]?.weeklyTarget
                // idx = index //> 0? index - 1 : 0
                break;
            }
            if (!target) target = value[1]?.weeklyTarget;

            if (subLine) {
                actual += input
                    ? value[1]?.lines?.[subLine.id]?.actual && !isNAN(value[1]?.lines?.[subLine.id]?.actual)
                        ? parseInt(value[1]?.lines?.[subLine.id]?.actual)
                        : 0
                    : parseInt(value[1]?.actual) ?? 0;
            } else {
                actual += value[1]?.actual ? parseInt(value[1]?.actual) : 0;
            }
            remarks.push({
                time: value[1]?.timestamp,
                text: value[1]?.remarks,
            });
        }
        // for (const value of weekData.entries()) {

        //     remarks.push({
        //         time: value[1]?.timestamp,
        //         text: value[1]?.remarks,
        //     });
        // }

        // if (!idx) idx = weekData.length - 1
        if ((!actual || actual === 0) && !target)
            return { target: "0", actual: "0", gap: "0", eff: "0", remarks: remarks };

        const calculated = this.calcValues(target, actual);

        const weekObj = {
            target: target,
            actual: actual,
            gap: calculated[0],
            eff: calculated[1],
            remarks: remarks,
        };

        return weekObj;
    };

    getWeekValues = (weekData, pastDate = null, subLine = null, input = false) => {
        console.log("🚀 ~ file: prdouctionCalc.js:230 ~ CALC ~ subLine:", subLine);
        if (!weekData || weekData?.length < 1) return { target: "0", actual: "0", gap: "0", eff: "0" };
        // const values = weekData.slice(0, 2)
        let today;
        if (pastDate) today = new Date(new Date(pastDate).toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        else today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        today.setHours(0, 0, 0, 0);

        const firstday = this.getStartOfWeek(today);
        const lastday = this.getTheEndOfTheWeek(firstday);

        // console.log(`
        // Current Week:
        // First Day: ${firstday}
        // Last Day: ${lastday}
        // `)

        let actual = 0;
        let remarks = [];

        for (const value of weekData.entries()) {
            if (value[1].timestamp >= lastday.getTime()) continue;
            if (value[1].timestamp < firstday.getTime()) {
                // idx = index //> 0? index - 1 : 0
                break;
            }
            if (subLine) {
                actual += input
                    ? value[1]?.lines?.[subLine.id]?.actual && !isNAN(value[1]?.lines?.[subLine.id]?.actual)
                        ? parseInt(value[1]?.lines?.[subLine.id]?.actual)
                        : 0
                    : parseInt(value[1]?.actual) ?? 0;
            } else {
                actual += value[1]?.actual ? parseInt(value[1]?.actual) : 0;
            }
            remarks.push({
                time: value[1]?.timestamp,
                text: value[1]?.remarks,
            });
        }

        let idx;
        if (pastDate) {
            idx = weekData.findIndex((item) => item.timestamp === today.getTime());
        }
        if (!pastDate || idx === -1) idx = 0;

        // const { weeklyTarget } = this.getValues(data, true, subLine, weekData[idx]);
        const weeklyTarget = subLine ? weekData[idx]?.lines?.[subLine.id]?.weeklyTarget : weekData[idx]?.weeklyTarget;

        const calculated = this.calcValues(weeklyTarget, actual ? actual : 0);

        const weekObj = {
            target: weeklyTarget,
            actual: actual ?? 0,
            gap: calculated[0],
            eff: calculated[1],
            remarks: remarks,
        };

        return weekObj;
    };

    getMonthValues = (monthDate, pastDate = null, subLine = null, input = false) => {
        if (!monthDate || monthDate?.length < 1) return { target: "0", actual: "0", gap: "0", eff: "0" };
        let today;
        if (pastDate) today = new Date(new Date(pastDate).toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        else today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        today.setHours(0, 0, 0, 0);
        const firstday = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastday = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        let actual = 0;
        let remarks = [];
        console.log(subLine);

        for (const value of monthDate.entries()) {
            // if (value.timestamp < lastDay.getTime()) break;
            if (value[1]?.timestamp >= lastday.getTime()) continue;
            if (value[1]?.timestamp < firstday.getTime()) {
                // idx = index //> 0? index - 1 : 0
                break;
            }
            if (subLine) {
                actual += input
                    ? value[1]?.lines?.[subLine.id]?.actual && !isNAN(value[1]?.lines?.[subLine.id]?.actual)
                        ? parseInt(value[1]?.lines?.[subLine.id]?.actual)
                        : 0
                    : parseInt(value[1]?.actual) ?? 0;

                remarks.push({
                    time: value[1]?.lines?.[subLine.id]?.timestamp,
                    text: value[1]?.lines?.[subLine.id]?.remarks,
                });
            } else {
                actual += value[1]?.actual ? parseInt(value[1]?.actual) : 0;
                remarks.push({
                    time: value[1]?.timestamp,
                    text: value[1]?.remarks,
                });
            }
        }

        let idx;
        if (pastDate) {
            idx = monthDate.findIndex((item) => item.timestamp === today.getTime());
        }
        if (!pastDate || idx === -1) idx = 0;

        //const { monthlyTarget } = this.getValues(monthDate[idx]);
        const monthlyTarget = subLine
            ? monthDate[idx]?.lines?.[subLine.id]?.monthlyTarget
            : monthDate[idx]?.monthlyTarget;

        const calculated = this.calcValues(monthlyTarget, actual ? actual : 0);

        const monthObj = {
            target: monthlyTarget,
            actual: actual ? actual : 0,
            gap: calculated[0],
            eff: calculated[1],
            remarks: remarks,
        };

        return monthObj;
    };

    handleReportRemarks = (data, cause, remarks) => {
        let others = [];
        let obj = { name: data?.name, timestamp: data?.timestamp, data: [] };
        if (data?.remarks && Array.isArray(data?.remarks)) {
            if (data.remarks.length > 0) {
                data.remarks.forEach((item) => {
                    if (cause && cause !== "false" && item.cause !== cause) return others.push(item);
                    obj.data.push(item);
                });
            }
        } else if (data?.remarks && (!cause || cause === "false")) {
            obj.data.push({ text: data?.remarks });
        }
        obj["others"] = others;

        if (obj.data.length < 1) {
            if (others.length < 1) return;
            remarks.push(obj);
            return;
        }
        remarks["show"] = true;
        remarks.push(obj);
    };

    getReportValues = (reportData, fromDate, toDate = null, cause) => {
        console.log(`Cause: ${cause}`);
        if (!reportData || reportData?.length < 1 || !fromDate) return { target: "0", actual: "0", gap: "0", eff: "0" };

        const from = new Date(fromDate);

        if (!toDate) {
            const objToDis = this.getTodaysValues(reportData, fromDate);
            let remarks = [];
            if (!objToDis.remarks) return objToDis;
            this.handleReportRemarks(objToDis, cause, remarks);
            objToDis.remarks = remarks;
            return objToDis;
        }
        const to = new Date(toDate);

        let actual = 0;
        let target = 0;
        let remarks = [];
        let shiftHrs = 0;
        let abs = 0;

        for (const value of reportData.entries()) {
            // if (value.timestamp < lastDay.getTime()) break;
            if (value[1].timestamp > to.getTime()) continue;
            if (value[1].timestamp < from.getTime()) {
                // idx = index //> 0? index - 1 : 0
                break;
            }

            actual += value[1]?.actual ? parseInt(value[1]?.actual) : 0;
            target += value[1]?.dailyTarget ? parseInt(value[1]?.dailyTarget) : 0;
            shiftHrs += value[1]?.totalHrs ? parseInt(value[1]?.totalHrs) : 0;
            abs += value[1]?.manpower?.abs ? parseInt(value[1]?.manpower?.abs) : 0;
            this.handleReportRemarks(value[1], cause, remarks);
            // if ( value[1]?.remarks && Array.isArray(value[1]?.remarks)) remarks = remarks.concat({items: value[1]?.remarks, timestamp: value[1]?.timestamp})
            // else if (value[1]?.remarks) remarks.push({text: value[1]?.remarks, timestamp: value[1]?.timestamp})
        }

        console.log(remarks);
        console.log(`Actual: ${actual}`);
        console.log(`Target: ${target}`);

        const calculated = this.calcValues(target, actual ? actual : 0);

        const reportObj = {
            target: target,
            actual: actual ? actual : 0,
            gap: calculated[0],
            eff: calculated[1],
            abs: abs,
            totalHrs: shiftHrs, //totalHrs
            remarks: remarks,
            lineId: reportData[0]?.lineId,
        };

        return reportObj;
    };

    calculateBreaks = (currTime, hours, breaks) => {
        let numOfBreaks = 0;
        for (let i = 1; i <= hours; i++) {
            if (breaks.includes(`${parseInt(currTime) + i}`)) numOfBreaks += 1;
            // console.log(`time breaks: ${parseInt(currTime) + i}`)
            // console.log(breaks)
        }
        return numOfBreaks;
    };

    calcHourlyData(hours, target, breaks = [12, 22], startShift = null) {
        const currentTime = startShift
            ? startShift
            : new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })).getHours();
        const numBreaks = this.calculateBreaks(currentTime, hours, breaks);
        // console.log(`number of Breaks is: ${numBreaks}`)
        const expectedHourlyInput = Math.round(target / (hours - numBreaks));
        const expectInputArr = [];

        if (expectedHourlyInput * (hours - numBreaks) < target) {
            let remaining = target - expectedHourlyInput * (hours - numBreaks);
            for (let index = 0; index < hours; index++) {
                if (breaks.includes(`${parseInt(currentTime) + index}`)) {
                    expectInputArr.push("Break Time");
                    continue;
                }
                if (remaining > 0) {
                    expectInputArr.push(expectedHourlyInput + 1);
                    remaining -= 1;
                    continue;
                }
                expectInputArr.push(expectedHourlyInput);
            }
        } else if (expectedHourlyInput * (hours - numBreaks) > target) {
            let gap = expectedHourlyInput * (hours - numBreaks) - target;
            //diffrent indexes becuase this array will be reversed
            for (let index = 0; index < hours; index++) {
                if (breaks.includes(`${parseInt(currentTime) + index}`)) {
                    expectInputArr.push("Break Time");
                    continue;
                }
                if (gap > 0) {
                    expectInputArr.push(expectedHourlyInput - 1);
                    gap -= 1;
                    continue;
                }
                expectInputArr.push(expectedHourlyInput);
            }
            return expectInputArr; //.reverse()
        } else {
            for (let index = 0; index < hours; index++) {
                if (breaks.includes(`${parseInt(currentTime) + index}`)) {
                    expectInputArr.push("Break Time");
                    continue;
                }
                expectInputArr.push(expectedHourlyInput);
            }
        }
        return expectInputArr;
        // expectInputArr.sort();
        // return expectInputArr.reverse();
    }

    getCurrentHour = () => {
        const time = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
        return time.getHours();
    };

    updatingStyling = async (card, hasPrinted, mobile=false) => {
        console.log(card.children)
        // if the printing has completed update the styles to the original values
        if (hasPrinted) {
            card.style.removeProperty("height");
            //re-display the elements that were hidden on the printed report
            document.querySelectorAll(".hide_print")?.forEach((selector) => {
                selector.style.removeProperty("display");
            });

            card.style.setProperty("height", "90vh", "important");

            if (mobile){
                // card.style.setProperty("scale", "0.6", "important")
                card.classList.remove("mobile_print")
                // card.style.setProperty("width", "90vw", "important")
                // card.children[2].style.setProperty("flex-wrap", "wrap", "important")
                // card.children[2].childNodes[0].style.setProperty("flex-wrap", "wrap", "important")
                // card.children[2].childNodes[1].style.setProperty("flex-wrap", "wrap", "important")
                // card.children[2].childNodes[2].style.setProperty("flex-wrap", "wrap", "important")
                // card.children[4].style.setProperty("width", "90%", "important")

                // card.children[2].childNodes[1].style.setProperty("scale", "0.7", "important")
                // card.children[2].childNodes[2].style.setProperty("scale", "0.7", "important")
            }
            return;
        }

        // make the invoice sheet larger and the invoice fet the new width and height
        // card.style.removeProperty("width");
        card.style.removeProperty("height");
        document.querySelectorAll(".hide_print")?.forEach((selector) => {
            selector.style.setProperty("display", "none", "important");
        });

        // card.style = `height: 485px !important; width: 335px !important;`;

        // card.style.setProperty("width", "750px", "important")
        if(mobile){
            // return console.log(card.children)
            card.classList.add("mobile_print")
            // card.style.setProperty("scale", "1", "important")
            // card.style.setProperty("width", "750px", "important")
            // card.children[2].childNodes[0].style.removeProperty("flex-wrap")
            // card.children[2].childNodes[1].style.removeProperty("flex-wrap")
            // card.children[2].childNodes[2].style.removeProperty("flex-wrap")
            // card.children[4].style.setProperty("width", "750px", "important")
            // card.style.setProperty("height", "750px", "important")
        }
        card.style.setProperty("height", "fit-content", "important");

        //cardNodes.button.style = "display: none;"
    };

    SendPDF = async (report) => {
        let isMobile = false
        if ( window.screen.width < "801") isMobile = true

        await this.updatingStyling(report, false, isMobile);
        var opt = {
            jsPDF: { format: "a4", orientation: "p" },
            margin: [5, 5, 5, 5],
            pagebreak: { mode: "avoid-all" },
            html2canvas: {
                dpi: 192,
                scale: 4,
                letterRendering: true,
                useCORS: true,
            },
        };
        //Create and Save the PDF file using html2pdf.js
        return await html2pdf()
            .set(opt)
            .from(report)
            .toPdf()
            .get("pdf")
            // You have access to the jsPDF object and can use it as desired.
            .then(async (pdfObj) => {
                //Save the file

                const pdfFile = await pdfObj.output("datauristring");
                console.log(pdfFile);

                await this.updatingStyling(report, true, isMobile);
                return pdfFile;
            })
            .catch((err) => {
                console.error("oops, something wents wrong!", err);
            });
    };

    downloadPDF = async (report, name) => {
        // const pages = report
        // console.log("🚀 ~ file: prdouctionCalc.js:598 ~ CALC ~ downloadPDF= ~ report:", report.clientHeight)
        // console.log("🚀 ~ file: prdouctionCalc.js:598 ~ CALC ~ downloadPDF= ~ report:", report.scrollHeight)
        let isMobile = false
        if ( window.screen.availWidth < 801) isMobile = true
        
        await this.updatingStyling(report, false, isMobile);
        var opt = {
            jsPDF: { format: "a4", orientation: "p" },
            margin: [5, 5, 5, 5],
            pagebreak: { mode: "avoid-all" },
            html2canvas: {
                dpi: 192,
                scale: 4,
                letterRendering: true,
                useCORS: true,
            },
        };
    
        //Create and Save the PDF file using html2pdf.js
        await html2pdf()
            .set(opt)
            .from(report)
            .toPdf()
            .get("pdf")
            // You have access to the jsPDF object and can use it as desired.
            .then(async (pdfObj) => {
                //Save the file

                pdfObj.save(name + ".pdf");
                await this.updatingStyling(report, true, isMobile);
            })
            .catch((err) => {
                console.error("oops, something wents wrong!", err);
            });
    };
}

const instance = new CALC();
export default instance;

// if () {
//     if (subLine) {
//         delete todaysData?.lines?.[subLine?.id].hourlyInput;
//         delete todaysData?.lines?.[subLine?.id].remarks;
//     } else {
//         delete todaysData?.hourlyInput;
//         delete todaysData?.remarks;
//     }
//     const calculated = this.calcValues(todaysData.dailyTarget, "0");
//     // return {
//     //     target: todaysData.dailyTarget,
//     //     monthlyTarget: todaysData.monthlyTarget,
//     //     weeklyTarget: todaysData.weeklyTarget,
//     //     actual: "0",
//     //     totalShifts: todaysData.totalShifts,
//     //     totalHrs: todaysData.totalHrs,
//     //     gap: calculated[0],
//     //     eff: calculated[1],
//     //     abs: todaysData.abs,
//     // };
//     return {
//         ...todaysData,
//         actual: "0",
//         target: todaysData.dailyTarget,
//         gap: calculated[0],
//         eff: calculated[1],
//     };
// }

// getPastValues = (data, date) => {
//     if (!data || data?.length < 1) return  {target: "0", actual: "0", gap: "0", eff:"0"}

//     const today = new Date(new Date(date).toLocaleString('en-US', {timeZone: "Asia/Riyadh"}))
//     today.setHours(0,0,0,0);

//     const findIdx = data.findIndex((item) => item.timestamp === today.getTime())

//     if (findIdx === -1){
//         return {target: "0", actual: "0", gap: "0", eff:"0"}
//     }
//     const { actual, dailyTarget, weeklyTarget, monthlyTarget, totalShifts, totalHrs } = this.getValues(data[findIdx])

//     if(data[findIdx]?.timestamp !== today.getTime()){
//         const calculated = this.calcValues(dailyTarget, "0")
//         return { target: dailyTarget, monthlyTarget: monthlyTarget, weeklyTarget: weeklyTarget, actual: "0", totalShifts: totalShifts, totalHrs: totalHrs, gap: calculated[0], eff:calculated[1]}
//     }

//     const calculated = this.calcValues(dailyTarget, actual)

//     return {target:dailyTarget, actual: actual, gap: calculated[0], eff:calculated[1], ...data[0]}
// }

//const today = new Date(new Date().toLocaleString('en-US', {timeZone: "Asia/Riyadh"}))
// const yesterday = new Date(today.getTime() - 1000*60*60*24)
// yesterday.setHours(0,0,0,0);
//if(weekData[1].timestamp !== yesterday.getTime() || weekData[0].timestamp !== yesterday.getTime()) return  {target: "0", actual: "0", gap: "0", eff:"0"}

//return weekData[1].timestamp === yesterday.getTime()? weekData[1] : weekData[0]

// deleteProps = (obj, prop) => {
//     for (const p of prop) {
//         delete obj[p];
//     }
// }

// const lastDay = new Date()
// lastDay.setDate(today.getDate() - today.getDay())
// console.log(`lastDay's date Value: ${lastDay}`)

// let idx = 5
//
// let startDate = new Date(today.getFullYear(), today.getMonth()+1, 1)
// console.log(`Start Of The Month: ${startDate}`)
// if (startDate.getTime() === today.getTime()) return startDate

// while (idx !== 0) {
//     startDate = new Date(startDate.setDate(startDate.getDate()+6));
//     console.log(startDate)
//     // if (startDate.getTime() < today.getTime()){
//     //     break;
//     // }
//     idx -= 1;
// }
// return startDate

// let idx = 8
// let endDate = new Date(new Date().toLocaleString('en-US', {timeZone: "Asia/Riyadh"}))
// if (endDate.getDay() === 0) return endDate

// while (idx !== 0) {
//     endDate = new Date(endDate.setDate(endDate.getDate()+1));
//     console.log(endDate)
//     if (endDate.getDay() === 0){
//         break;
//     }
//     idx -= 1;
// }
// return endDate
