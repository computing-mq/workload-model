

export function blankView(targetid) {
    let target = document.getElementById(targetid);
    target.innerHTML = "";
}

// listactivitiesView - generate a view of a list of activities
//   and insert it at `targetid` in the document
export function listPersonactivitiesView(targetid, year, person, grouped) {

    console.log(grouped)

    const target = document.getElementById(targetid);
    target.innerHTML = "";  // wipe children

    const heading = document.createElement('h4');
    heading.innerHTML = `${person.first_name} ${person.last_name}`;
    target.appendChild(heading);

    const loaddiv = document.createElement("div")
    loaddiv.innerHTML = `<h5>Allocated Load: ${person.load.total.toFixed(1)} points</h5>`;
    target.appendChild(loaddiv);

    const infopara = document.createElement('p')
    infopara.innerHTML = "Allocated load is measured in workload points, one point is equivalent to around 15 hours.  A breakdown of points is shown in the 'Load' column below.";
    target.appendChild(infopara);

    for(const key in grouped) {
        const table = document.createElement('data-table');
        table.title = key + " (" + person.load[key].toFixed(1) + " points)";
        table.headings = {
            code: {title: 'Unit', format: v => `<a href=#!/${year}/offerings/${v.offeringid}>${v.code}</a>`}, 
            
            activity: {title: 'Activity'},
            quantity: {title: 'Quantity', format: v => v.quantity.toFixed(1)},
            load: {title: 'Load', format: v => v.load.toFixed(2)}
        }
        table.data = grouped[key];

        target.appendChild(table);
    }
}

// listPeopleView - generate a view of a list of people
//   and insert it at `targetid` in the document
export function listPeopleView(targetid, year, people) {

    const target = document.getElementById(targetid);
    if (target.querySelector('user-list') != null) {
        return
    }

    const ul = document.createElement('user-list');
    ul.year = year
    ul.people = people;
    target.innerHTML = "";  // wipe children
    target.appendChild(ul);
}

// listOfferingsView - generate a view of a list of offerings
//   and insert it at `targetid` in the document
export function listOfferingsView(targetid, year, offerings) {

    const target = document.getElementById(targetid);
    if (target.querySelector("offering-table") != null) {
        return
    }

    const ol = document.createElement('offering-table');
    ol.year = year
    ol.offerings = offerings;
    target.innerHTML = "";  // wipe children
    target.appendChild(ol);
}

// listOfferingactivitiesView - generate a view of a list of activities for an offering
//   and insert it at `targetid` in the document
export function listOfferingactivitiesView(targetid, year, offering, activities) {
    const target = document.getElementById(targetid);
    target.innerHTML = "";  // wipe children

    const table = document.createElement('data-table');
    table.title = `${offering.code} ${offering.session}`;
    table.subtitle = offering.title
    table.headings = {
        staff: {title: 'Staff', format: v => `<a href=#!/${year}/staff/${v.staffid}>${v.staff}</a>`}, 
        activity: {title: 'Activity'},
        quantity: {title: 'Quantity', format: v => v.quantity.toFixed(2)},
        load: {title: 'Load', format: v => v.load.toFixed(2)}
    }
    table.data = activities;

    target.appendChild(table);

    let theSession = ''
    if (offering.session === 'Session 1') {
        theSession = 'S1'
    } else if (offering.session === 'Session 2') {
        theSession = 'S2'
    } else {
        theSession = 'S3'
    }
    const timetableLink = `https://timetables.mq.edu.au/${offering.year}/Reports/Calendar.aspx?objects=${offering.code}/${theSession}/F2F-DAY&weeks=9-23&days=1-7&periods=6-32&template=macquarie_module_grid`
    const handbookLink = `https://coursehandbook.mq.edu.au/${offering.year}/units/${offering.code}/?year=${offering.year}`
    
    const loaddiv = document.createElement("div")
    loaddiv.innerHTML = `<p>Estimated Enrollment: <strong>${offering.enrollment}</strong></p>`;
    loaddiv.innerHTML += `<p>Lecture hours <strong>${offering.lectureHours}</strong>.  Workshop hours <strong>${offering.SGTAHours}</p>`;
    if (offering.newUnit) {
        loaddiv.innerHTML += '<p>This is a new unit and attracts a workload bonus for unit preparation.</p>';
    }
    loaddiv.innerHTML += `<p>Required marking load: <strong>${offering.load.marking.toFixed(1)}</strong> (<strong>${(offering.load.marking * 15.75).toFixed(1)}</strong> hours), <strong>${(100* offering.allocated.marking/offering.load.marking).toFixed(1)}%</strong> (<strong>${(15.75 * offering.allocated.marking).toFixed(1)}</strong> hours) allocated.</p>`;
    loaddiv.innerHTML += `<p>Required tutorials/labs: <strong>${offering.load.tutorialClasses}</strong>, allocated <strong>${offering.allocated.tutorialClasses}</strong>.</p>`;
    
    loaddiv.innerHTML += `<p><a target=new href="${timetableLink}">Timetable</a>`
    loaddiv.innerHTML += `<p><a target=new href="${handbookLink}">Handbook</a>`

    target.appendChild(loaddiv);
    
}


export function mainMenuView(targetid, year, years) {

    const target = document.getElementById(targetid);

    if (year) {
        target.innerHTML = `
        <h1>Computing Teaching Allocation: ${year}</h1>

        <nav> 
        <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#!/${year}/staff">Staff Summary</a></li>
        <li><a href="#!/${year}/offerings">Unit Offering Summary</a></li>
        </ul>
        <button onclick='window.reloadData()'>Refresh</button>
        </nav>`
    } else {
        let yearlist = ''
        for (const y of years) {
            yearlist += `<li><a href="#!/${y}/staff">${y} Staff Summary</a></li>`
        }
        target.innerHTML = `
        <h1>Computing Teaching Allocation</h1>
        
        <nav>
          <ul>${yearlist}
          </ul>
        </nav>`
            }
}
