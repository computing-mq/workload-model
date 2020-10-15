// Implementation of the FSE Workload model for Computing

/**
 * Compute convening load for a unit enrollment
 *  Include load for consultation and assessment + exam development
 * @param {number} enrollment 
 * @param {boolean} pace 
 * @returns {number} convening load in workload points
 */
const convening = (enrollment, pace) => {

    let result = 0.0

    if (enrollment > 0) {
        result = 0.8 + 0.09 * ((enrollment-1) ** 0.7) 
        result += Math.min(0.02*enrollment, 2.0)   // consultation load
        result += 1.0                         // assessment and exam development (max 1.75)
    }

    if (pace === "PACE") {
        result += 5.0  // bonus for PACE convening
    }

    return result
}

/**
 * Compute lecturing load for a unit 
 * @param {number} perWeek 
 * @returns {number} lecturing load in workload points
 */
const lecturing = (perWeek) => {
    return 13 * perWeek * 0.25
}

/**
 * Compute tutorial load for a unit 
 *  use the rate for low preparation prac/lab/workshop supervision
 *  assume prep work is part of convening/lecturing load
 * @param {number} perWeek 
 * @returns {number} tutorial load in workload points
 */
const tutorial = (perWeek) => {
    return 13 * perWeek * 0.1 
}

/**
 * Compute marking load for a unit given an assumed
 *  time per student
 * @param {Number} enrollment 
 * @param {Number} perStudent hours marked per student
 * @returns {number} convening load in workload points
 */
const marking = (enrollment, perStudent) => {
    return 0.063 * perStudent * enrollment
}

/**
 * Compute the load for supervising `n` coursework project students
 * @param {Number} n 
 * @returns {number} convening load in workload points
 */
const projectSupervision = (n) => {
    return 1.0 * n
}


/**
 * Compute unit loading for new unit development
 * @param {Number} newUnit  
 * @returns {number} convening load in workload points
 */
const unitLoading = (newUnit) => {
    if (newUnit) {
        return 5.0
    } else {
        return 0.0
    }
}

/**
 * Compute the overall load for a unit
 * @param {Object} unit 
 */
const computeOfferingLoad = (unit) => {
    const nTutorials = Math.ceil(unit.enrollment/30)
    const conveningLoad = convening(unit.enrollment, unit.lectureType === 'PACE')
    const loading = unitLoading(unit.newUnit === 1.0)

    // lectuer gets lecturing load + half convening load + loading unless no students
    let lecturer = 0.0
    if (unit.enrollment > 0) {
        lecturer = lecturing(unit.lectureHours) + conveningLoad/2
    }

    return {
        convener: conveningLoad/2, // convener gets half of the convening load
        lecturer: lecturer,
        loading: loading,
        tutorialClasses: nTutorials,
        tutorial: tutorial(unit.SGTAHours) * nTutorials,
        marking: marking(unit.enrollment, 1.0)  // 1 hr per student
    }

}

// ---  above are the functions from model.py ----

// --- below is the logic from workload.py to compute workload


/**
 * Given an activity, compute the associated workload and add it as
 * a property to the object, returning a copy
 * @param {Object} activity 
 */
const computeWorkload = (activity, offerings) => {
    let workload = 0.0;
    const offering = offerings[activity.offeringid]
    switch (activity.activity) {
        case "Convener":
            workload = convening(offering.enrollment, offering.lectureType) / 2.0
            break
        case "Lecturer":
            workload = (lecturing(offering.lectureHours) 
                        + convening(offering.enrollment, offering.lectureType)/2.0 
                        ) * activity.quantity
            break
        case "Marking":
            workload = Math.min(activity.quantity * marking(offering.enrollment, 1.0), activity.quantity)
            break
        case "SGTA":
            workload = tutorial(offering.SGTAHours)
            break
        case "Bonus":
            workload = activity.quantity
            break
    }
    return workload
}

export default {
    convening, lecturing, marking, tutorial,
    projectSupervision, unitLoading, 
    computeOfferingLoad, computeWorkload
}

