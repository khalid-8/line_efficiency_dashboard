import React, { useRef, useState } from 'react';
import { HiOutlineDocumentDownload } from 'react-icons/hi';
import DatePicker from './DatePicker';
import "./styles/generateReport.css"
import Report from './Report';
import { Button, Form } from 'react-bootstrap';
import classify from "./issuesClassifications.json"
import linesInfo from "./linesInfo.json"

function GenerateReport({showSpinner}) {
    const [showReportFilter, setShowReportFilter] = useState(false)
    const [dates, setDates] = useState()
    const [displayReport, setDisplayReport] = useState(false)

    const linesRef = useRef()
    const remarksReason = useRef()

    return (
        <div style={{position: "relative"}}>
            
                <div className='generate_div'
                onClick={() => setShowReportFilter(true)}>
                    <b>Generate Report</b>
                    <HiOutlineDocumentDownload style={{fontSize: "30px"}}/>
                </div>
            {showReportFilter&&
            <div className='blurBG' style={{maxHeight: "100vh"}}>
                <div className='report_filter'>
                    
                    {/* <Form.Control type="date" value={pastDateFilter} style={{width: "240px"}} max={new Date().toISOString().split('T')[0]} onChange={(e) => setPastDate(e.target.value)}/> */}
                    <p>Pick a Date or Time Period:</p>
                    <DatePicker dates={setDates}/>
                    <Form.Group className='mb-4'>
                        <Form.Label>Specify a Line</Form.Label>
                        <Form.Select aria-label="Pick a Line" ref={linesRef}>
                            <option key='blankChoice' value={false} selected>All</option>
                            {linesInfo.lines.map((item) => (
                                <option value={item.id}>{item.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className='mb-4'>
                        <Form.Label>Specify Remarks Classification</Form.Label>
                        <Form.Select aria-label="Delay Cause" ref={remarksReason}>
                            <option key='blankChoice' value={false} selected>All</option>
                            {classify.issues.map((item) => (
                                <option value={item.id}>{item.cause}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {displayReport &&
                        <>
                        <br style={{width: '100%', border: "1px solid black"}}/>
                        <Report timePeriod={dates} show={setDisplayReport} line={linesRef.current?.value} cause={remarksReason.current?.value} showSpinner={showSpinner}/>
                        </>
                    }

                    <div className='d-flex w-100 justify-content-center' style={{columnGap: "10px"}}>
                        <Button variant="outline-primary" onClick={async() => {  
                            setDisplayReport(true)
                        }}>
                            Generate
                        </Button>
                        <Button variant="outline-danger" onClick={() => setShowReportFilter(false)}>Cancel</Button>
                    </div>
                </div>
            </div>
            }
        </div>
    );
}

export default GenerateReport;