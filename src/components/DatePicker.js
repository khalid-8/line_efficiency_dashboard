import React, { useEffect, useState } from 'react';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import './styles/datePicker.css'
import { DateRangePicker } from 'react-date-range';
import { isEqual } from 'date-fns'; // addDays, subDays,
// import { Button } from 'react-bootstrap';
// import { API } from '../helpers';

export default function DatePicker({dates}) {
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    useEffect(() => {
        dates({startDate: new Date().toLocaleString().split(',')[0].replaceAll("/", '-')})
        // eslint-disable-next-line
    }, [])
    
    const handleSelect = (ranges) => {
        setDateRange([ranges.selection])
        if (isEqual(ranges.selection.startDate, ranges.selection.endDate)){
            return dates({startDate: ranges.selection.startDate.toLocaleString().split(',')[0].replaceAll("/", '-')})
        }
        dates({startDate: ranges.selection.startDate.toLocaleString().split(',')[0].replaceAll("/", '-'), endDate: ranges.selection.endDate.toLocaleString().split(',')[0].replaceAll("/", '-') })
    }

    return (
        <div className='calendar_picker_el'>

            <div className='calendar_picker_div'>
                <DateRangePicker 
                    onChange={handleSelect}
                    maxDate={new Date()}
                    direction="vertical"
                    showMonthAndYearPickers={false}
                    showDateDisplay={false}
                    showPreview={false}
                    ranges={dateRange}
                    className='calendar_picker'
                />
            </div>
            
        </div>
    );
}

                        // try {
                        //     console.log(dateRange)
                        //     showSpinner(true)
                        //     if (isEqual(dateRange[0].startDate, dateRange[0].endDate)){
                        //         await API.generateReport(true, dateRange[0].startDate.toLocaleString().split(',')[0].replaceAll("/", '-'), null)
                        //     }else{
                        //         await API.generateReport(true, dateRange[0].startDate.toLocaleString().split(',')[0].replaceAll("/", '-'), dateRange[0].endDate.toLocaleString().split(',')[0].replaceAll("/", '-'))
                        //     }
                        //     showSpinner(false)
                        // } catch (err) {
                        //     console.log(err)
                        // } 

                        // console.log(dateRange)
                        // from(dateRange[0].startDate.toLocaleString().split(',')[0].replaceAll("/", '-'))
                        // to(dateRange[0].endDate.toLocaleString().split(',')[0].replaceAll("/", '-'))
                        // setFilter(false)