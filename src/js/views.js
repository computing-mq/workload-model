

export function blankView(targetid) {
    let target = document.getElementById(targetid);
    target.innerHTML = "";
}

// listRecordsView - generate a view of a list of records
//   and insert it at `targetid` in the document
export function listPersonRecordsView(targetid, person, grouped) {

    const target = document.getElementById(targetid);
    target.innerHTML = "";  // wipe children

    const heading = document.createElement('h4');
    heading.innerHTML = `${person.first_name} ${person.last_name}`;
    target.appendChild(heading);

    const loaddiv = document.createElement("div")
    loaddiv.innerHTML = `<h5>Allocated Load: ${person.load.total.toFixed(1)}</h5>`;
    target.appendChild(loaddiv);


    for(const key in grouped) {
        const table = document.createElement('data-table');
        table.title = key + " (" + person.load[key].toFixed(1) + ")";
        table.headings = {
            unit_code: {title: 'Unit', format: v => `<a href=#!/offerings/${v.offeringId}>${v.unit_code}</a>`}, 
            
            activity: {title: 'Activity'},
            quantity: {title: 'Quantity', format: v => v.quantity.toFixed(1)},
            load: {title: 'Load', format: v => v.load.toFixed(2)}
        }
        console.log(grouped[key])
        table.data = grouped[key];

        target.appendChild(table);
    }
}

// listPeopleView - generate a view of a list of people
//   and insert it at `targetid` in the document
export function listPeopleView(targetid, people) {

    const target = document.getElementById(targetid);
    if (target.querySelector('user-list') != null) {
        return
    }

    const ul = document.createElement('user-list');
    ul.people = people;
    target.innerHTML = "";  // wipe children
    target.appendChild(ul);
}

// listOfferingsView - generate a view of a list of offerings
//   and insert it at `targetid` in the document
export function listOfferingsView(targetid, offerings) {

    const target = document.getElementById(targetid);
    if (target.querySelector("offering-table") != null) {
        return
    }

    const ol = document.createElement('offering-table');
    ol.offerings = offerings;
    target.innerHTML = "";  // wipe children
    target.appendChild(ol);
}

// listOfferingRecordsView - generate a view of a list of records for an offering
//   and insert it at `targetid` in the document
export function listOfferingRecordsView(targetid, offering, records) {
    const target = document.getElementById(targetid);

    const table = document.createElement('data-table');
    table.title = `${offering.unit_code} ${offering.session}`;
    table.headings = {
        staff: {title: 'Staff', format: v => `<a href=#!/staff/${v.staffid}>${v.staff}</a>`}, 
        activity: {title: 'Activity'},
        quantity: {title: 'Quantity', format: v => v.quantity.toFixed(1)},
        load: {title: 'Load', format: v => v.load.toFixed(2)}
    }
    table.data = records;
    target.innerHTML = "";  // wipe children
 
    target.appendChild(table);
}