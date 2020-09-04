// const showText = (section, field) => {
//     return thisIngestion[section][field];
// };

/**
 * complete ingestion scheduling
 */
const completeIngestion = () => {
    ingestionStatus = 'complete';
    const areaNames = $('#ingestion-names');
    let comMsg = 'Your ingestion ( ';
    if (thisIngestion.pipeline.name) {
        comMsg += '<span>' + thisIngestion.pipeline.name + '</span>';
    }
    if (thisIngestion.pipeline.project_name) {
        comMsg += '<span>' + thisIngestion.pipeline.project_name + '</span>';
    }
    comMsg += ' ) has successfully been scheduled.';
    areaNames.addClass('complete').html(comMsg);
    clearFormData();
    changeSection(null, 0);
    $('.breadcrumb li:not(.names)').hide();
};

const showAllValues = (fieldName) => {
    const valList = $('#review_value_' + fieldName);
    valList.hasClass('show-all') ? valList.removeClass('show-all') : valList.addClass('show-all');
};