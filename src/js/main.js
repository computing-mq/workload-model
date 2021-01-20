import {Model} from './model.js';
import * as views from './views.js';
import {split_hash} from './util.js';
 

function redraw() {

    let hash = split_hash(window.location.hash);

    switch (hash.path) {
        case "staff": 
            document.getElementById('homepage').className = 'hidden';

            let people = Model.get_people_with_load(hash.year);
            views.listPeopleView("mainlist", hash.year, people);
            if (hash.id) {
                let person = Model.get_person(hash.year, hash.id);
                let activities = Model.filter_activities(Model.get_activities(hash.year), "staff", person.name);
                let grouped = Model.group_activities(activities, "session");
                views.listPersonactivitiesView("detail", hash.year, person, grouped);
            } else {
                views.blankView("detail");
            }
            break;
        case "offerings": 
            document.getElementById('homepage').className = 'hidden';

            let offerings = Model.get_offerings(hash.year);
            views.listOfferingsView("mainlist", hash.year, offerings);
            if (hash.id) {
                let offering = Model.get_offering(hash.year, hash.id);
                let activities = Model.filter_activities(Model.get_activities(hash.year), "code", offering.code);
                activities = Model.filter_activities(activities, "session", offering.session);
                views.listOfferingactivitiesView("detail", hash.year, offering, activities);
            } else {
                views.blankView("detail");
            }
            break;
        default:
            views.blankView("mainlist");
            views.blankView("detail");
            document.getElementById('homepage').className = 'show';
    }
    views.mainMenuView('header', hash.year, Model.get_years())

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