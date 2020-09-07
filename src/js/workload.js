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
        result += min(0.02*enrollment, 2.0)   // consultation load
        result += 1.0                         // assessment and exam development (max 1.75)
    }

    if (pace) {
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


const unitPrototype = {
    enrollment: 99,
    lectureType: 'PACE', // or 'default'
    newUnit: true,
    sgtaHours: 2,
    lectureHours: 3
}

/**
 * Compute the overall load for a unit
 * @param {Object} unit 
 */
const computeLoad = (unit) => {
    const nTutorials = Math.ceil(unit.enrollment/30)

    
    const conveningLoad = convening(unit.enrollment, unit.lectureType === 'PACE')
    const loading = unit_loading(unit.newUnit === 1.0)

    // lectuer gets lecturing load + half convening load + loading unless no students
    let lecturer = 0.0
    if (unit.enrollment > 0) {
        lecturer = lecturing(unit.lectureHours) + convening_load/2
    }

    return {
        convener: conveningLoad/2, // convener gets half of the convening load
        lecturer: lecturer,
        loading: loading,
        tutorialClasses: nTutorials,
        tutorial: tutorial(unit.sgtaHours) * nTutorials,
        marking: marking(unit.enrollment, 1.0)  // 1 hr per student
    }

}

/**
 * Given an ar
 * @param {Object} offeringActivities 
 */
const unitOfferingActivities = (offeringActivities) => {
    
}