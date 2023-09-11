import React, { useEffect, useRef, useState } from 'react';
import "./styles/landing.css"
import { GenerateReport, LoadingSpinner, TargetGraph } from '../components';
import { useTableContext } from '../context';
import { CALC } from '../helpers';
import { useNavigate } from 'react-router';
import { Button, Card } from 'react-bootstrap';
import Remarks from './Remarks';
import linesInfo from "../components/linesInfo.json"
//generateReport
export default function Landing() {
    // const {pastDate} = useParams()

    const [linesData, setLinesData] = useState()
    const [overAll, setOverAll] = useState()
    const [activeView, setActiveView] = useState(0)
    const [showRemarks, setShowRemarks] = useState([])
    const [lineOfRemarks, setLineOfRemarks] = useState()
    const [showFullRemarks, setShowFullRemarks] = useState(false)
    const [showSpinner, setShowSpinner] = useState(false)

    const {data} = useTableContext()

    const navRefs = useRef([])

    const navigate = useNavigate()

    // useEffect(() => {
    //     if (!pastDate) return setPastDate('')
    //     setPastDate(pastDate)
    // }, [pastDate])

    useEffect(() => {
        if (!data) return
        const dataArr = []
        const remarksArr = []
        const start = Date.now();
        
        linesInfo.lines.forEach((item) => {
            const nmbs = data.get(item.id)
            const line = {
                name: item.name,
                id: item.id,
                data: {
                    daily: CALC.getTodaysValues(nmbs),
                    weekly: CALC.getWeekValues(nmbs),
                    lastWeek: CALC.getLastWeekValues(nmbs),
                    monthly: CALC.getMonthValues(nmbs)
                }
            }
            dataArr.push(line)
            remarksArr.push(false)
            console.log(line)
        })
        const end = Date.now();
        console.log(`Execution time: ${end - start} ms`);

        setShowRemarks(remarksArr)
        setLinesData(dataArr)
    }, [data])

    //Get overall target and actual
    useEffect(() => {
        setShowRemarks([false, false, false, false, false, false, false])
        if(!linesData || linesData.length < 1) return
        let totalTarget = 0
        let TotalActual = 0
        linesData.forEach((item) => {
            totalTarget+= parseInt(item.data?.[idxToNav(activeView)]?.target)//overallTargetCalc(item, activeView) 
            TotalActual+= parseInt(item?.data?.[idxToNav(activeView)]?.actual)
        })

        const calcuate = CALC.calcValues(totalTarget, TotalActual)
        setOverAll({target: totalTarget, actual: TotalActual, gap: calcuate[0], eff: calcuate[1]})
    }, [activeView, linesData])

    function idxToNav(idx){
        let name;
        switch(idx){
            case 0:
                name = "daily"
                break
            case 1:
                name = "weekly"
                break;
            case 2:
                name = "lastWeek"
                break;
            default:
                name = "monthly"
                break;
        }
        return name
    }
    const handleNavClick = (i) => {
        if (i === activeView) return
        navRefs.current[activeView]?.classList.remove("active")
        navRefs.current[i]?.classList.add("active")
        setActiveView(i)
    }
    const handleHover = (idx, item) => {
        const newArray = [false, false, false, false, false, false, false]
        newArray[idx] =  !newArray[idx]
        setShowRemarks(newArray)
        setLineOfRemarks(item)
    }
    return (
        <main className='landing-page'>
            <GenerateReport showSpinner={setShowSpinner}/>

            <LoadingSpinner msg={"Generating the Report"} show={showSpinner} waitingToLoad={false} />
            
            {showFullRemarks &&
                <Remarks name={lineOfRemarks?.name} line={lineOfRemarks?.data?.[idxToNav(activeView)]} period={idxToNav(activeView)} showFullRemarks={setShowFullRemarks}/>
            }

            <div className='landing_nav'>
                <nav className="active" ref={el => navRefs.current[0] = el}
                onClick={() => handleNavClick(0)}>
                    Daily
                </nav>
                <nav ref={el => navRefs.current[1] = el}
                onClick={() => handleNavClick(1)}>
                    Weekly
                </nav>
                <nav ref={el => navRefs.current[2] = el}
                onClick={() => handleNavClick(2)}>
                    Previous Week
                </nav>
                <nav ref={el => navRefs.current[3] = el}
                onClick={() => handleNavClick(3)}>
                    Monthly
                </nav>
            </div>

            {linesData && linesData.length > 6 &&
                <div className='dashboard-eff'>
                    <div className='dashboard-col'>
                        {linesData.slice(0, 5).map((item, i) => (
                            <span key={JSON.stringify(item)} className='line-eff' 
                                onMouseOver={() => handleHover(i, item)}
                                onMouseLeave={() => setShowRemarks([false, false, false, false, false, false, false]) }
                                onClick={(e) => {
                                    if (e.target.classList.contains('custom-btn')) return
                                    navigate(`/production/${item.id}`)
                                }}>

                                {showRemarks[i] && item?.data?.[idxToNav(activeView)]?.remarks?.length > 0 && <ShowRemarks line={item?.data?.[idxToNav(activeView)]} period={idxToNav(activeView)} showFullRemarks={setShowFullRemarks}/>}
                                <TargetGraph target={item?.data?.[idxToNav(activeView)]?.target} actual={item?.data?.[idxToNav(activeView)]?.actual} eff={item?.data?.[idxToNav(activeView)]?.eff} title={`${item?.name?.replace("LINE -", "")}`}/>
                            </span>
                        ))}
                    </div>
                    <div className='dashboard-col'>
                        {linesData.slice(5, 6).map((item, i) => (
                            <span key={JSON.stringify(item)} className='line-eff'
                            style={{marginRight: "2vw"}} 
                            onMouseOver={() => handleHover(i+5, item)}
                            onMouseLeave={() => setShowRemarks([false, false, false, false, false, false, false])}
                            onClick={(e) => {
                                if (e.target.classList.contains('custom-btn')) return
                                navigate(`/production/${item.id}`)
                            }}>

                                {showRemarks[i+5] && <ShowRemarks line={item?.data?.[idxToNav(activeView)]} period={idxToNav(activeView)} showFullRemarks={setShowFullRemarks}/>}
                                <TargetGraph target={item?.data?.[idxToNav(activeView)]?.target} actual={item?.data?.[idxToNav(activeView)]?.actual} eff={item?.data?.[idxToNav(activeView)]?.eff} title={`${item?.name?.replace("LINE -", "")}`}/>
                            </span>
                        ))}

                        <span className='overall-eff line-eff'>
                            <TargetGraph target={overAll?.target} actual={overAll?.actual} eff={overAll?.eff} title={`Overall efficiency`}/>
                        </span>

                        {linesData.slice(6, linesData.length).map((item, i) => (
                            <span key={JSON.stringify(item)} className='line-eff' 
                            style={{marginLeft: "2vw"}}
                            onMouseOver={() => handleHover(i+6, item)}
                            onMouseLeave={() => setShowRemarks([false, false, false, false, false, false, false])}
                            onClick={(e) => {
                                if (e.target.classList.contains('custom-btn')) return
                                navigate(`/production/${item.id}`)
                                }}>
                                
                                {showRemarks[i+6] && <ShowRemarks line={item?.data?.[idxToNav(activeView)]} period={idxToNav(activeView)} showFullRemarks={setShowFullRemarks}/>}
                                <TargetGraph target={item?.data?.[idxToNav(activeView)]?.target} actual={item?.data?.[idxToNav(activeView)]?.actual} eff={item?.data?.[idxToNav(activeView)]?.eff} title={`${item?.name?.replace("LINE -", "")}`}/>
                            </span>
                        ))}
                    </div>
                </div>
            }

        </main>
    );
}

function ShowRemarks({line, period, showFullRemarks}){
    let remeraksArr = []

    if ((period === "monthly" || period === "weekly" || period === "lastWeek") && line?.remarks?.length > 0){
        for(let idx in line.remarks){
            console.log(idx)
            if (!line.remarks[idx].text) continue;
            remeraksArr.push(
                {
                    date: `${new Date(line.remarks[idx]?.time).toLocaleString("en-GB", {timeZone: "Asia/Riyadh", weekday: "long"})}, ${new Date(line.remarks[idx]?.time).toLocaleString("en-GB", {timeZone: "Asia/Riyadh"}).split(',')[0]}`,
                    remarks: line.remarks[idx]?.text
                }
            )
        }
    }

    if (period === "daily" && line?.remarks){
        remeraksArr.push(
            {
                date: `${new Date(line?.timestamp).toLocaleString("en-GB", {timeZone: "Asia/Riyadh", weekday: "long"})}, ${new Date(line?.timestamp).toLocaleString("en-GB", {timeZone: "Asia/Riyadh"}).split(',')[0]}`,
                remarks: line?.remarks
            }
        )
    }

    console.log(remeraksArr)
    if (!remeraksArr || remeraksArr.length < 1) return

    return(
        <>
            <Card className='remarks-card'>
                <Card.Header style={{color: "red"}}>
                    Remarks
                </Card.Header>
                <Card.Body>
                    <div className='remarks-text'>
                        {remeraksArr.map((item) => (
                            <span key={JSON.stringify(item)}>
                                <b>{item.date}:</b>
                                {Array.isArray(item.remarks) && item.remarks.length > 0?
                                item.remarks?.map((remark, i) => (
                                    <div key={`${JSON.stringify(remark) + i}`}>
                                        {console.log(`${remark.from} - ${remark.to}`)}
                                        {console.log(remark.text)}
                                        <b>{remark.from} - {remark.to}</b>
                                        <p>{remark.text}</p>
                                    </div>
                                ))
                                :
                                <p>{item.remarks}</p>
                                }
                                
                            </span>
                        ))}
                    </div>
                    <Button className='mt-3 custom-btn' onClick={() => showFullRemarks(true)}>Show More</Button>
                </Card.Body>
            </Card>
        </>
    );
}

/* <Card className='display_menu'>
                <Card.Title>Displays</Card.Title>
                <Card.Body>

                    <ul className="menuItems">
                        {linesInfo.lines.map((item) => (
                            <li key={item.id}><a href={`/production/${item.id}`} >{item.name.split("-")[1]}</a></li>
                        ))}
                    </ul>
             
                </Card.Body>
            </Card> */