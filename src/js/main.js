import {Model} from './model.js';
import * as views from './views.js';
import {split_hash} from './util.js';
 

function redraw() {

    let hash = split_hash(window.location.hash);

    switch (hash.path) {
        case "staff": 
            document.getElementById('homepage').className = 'hidden';

            let people = Model.get_people_with_load();
            views.listPeopleView("mainlist", people);
            if (hash.id) {
                let person = Model.get_person(hash.id);
                let activities = Model.filter_activities(Model.get_activities(), "staff", person.name);
                let grouped = Model.group_activities(activities, "session");
                views.listPersonactivitiesView("detail", person, grouped);
            } else {
                views.blankView("detail");
            }
            break;
        case "offerings": 
            document.getElementById('homepage').className = 'hidden';

            let offerings = Model.get_offerings();
            views.listOfferingsView("mainlist", offerings);
            if (hash.id) {
                let offering = Model.get_offering(hash.id);
                let activities = Model.filter_activities(Model.get_activities(), "code", offering.code);
                activities = Model.filter_activities(activities, "session", offering.session);
                views.listOfferingactivitiesView("detail", offering, activities);
            } else {
                views.blankView("detail");
            }
            break;
        default:
            views.blankView("mainlist");
            views.blankView("detail");
            document.getElementById('homepage').className = 'show';
    }

    bindings();
    window.scrollTo(0,0);
}



function bindings() {

}

window.addEventListener("modelUpdated", function() {
     redraw();
})

window.onload = function() {
    Model.load(); 
}

window.onhashchange = redraw;