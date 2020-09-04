/**
 * filter through saved list of tags on keydown
 */
const filterTagOptions = (val) => {
    val = val.toLowerCase();
    $.each($('#tag-options .option'), function() {
        let p = $(this).text().toLowerCase();
        // console.log('typed val, this val', val, p);
        if (p.includes(val)) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
};

/**
 * select tag from selected option in list to edit key-value and hide list
 */
const selectTag = (name) => {
    console.log('adding this tag', name);
    $('#add-tag-name').val(name);
    setTimeout(() => {
        $('#tag-options').css('display', 'none');
    }, 200)
}

/**
 * update tags in thisIngestion
 * @{id} id of the tag
 * @{selected} true if selected, false if removed
 * @{ignoreThisIngestion} if true, don't update thisIngestion
 */
const updateTags = (newTag, ignoreThisIngestion) => {
    console.log('newTag, ignoreThisIngestion', newTag, ignoreThisIngestion);
    let newTicket = $('<div class="tag-ticket" id="tag_ticket_' + newTag.id + '"><span>' + newTag.name + ' [' + newTag.value + ']</span> <i class="fas fa-times-circle" title="Remove Tag" onClick="removeTag(\'' + newTag.id + '\')"></i></div>');
    $('#selected-tags').append(newTicket);
    selectedTags.push(newTag);
    if (!ignoreThisIngestion) {
        thisIngestion.pipeline.tags.push(newTag);
    }
    console.log('thisIngestion.pipeline.tags', thisIngestion.pipeline.tags);
};

// const buildTagsChoiceList = () => {
//     const tagChoices = $('#tag-choices');
//     tagChoices.html('');
//     availableTags.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
//     availableTags.map((option) => {
//         let opt = $('<option value="' + option.id + '">' + option.name + ' [' + option.value + ']</option>');
//         tagChoices.append(opt);
//     });
// }

/**
 * add a new tag to options list and select it
 */
const addNewTag = () => {
    let tn = $('#add-tag-name');
    let tv = $('#add-tag-value');
    const newTag = {
        id : Math.floor(Math.random() * 1001),
        name : tn.val(),
        value : tv.val()
    };
    updateTags(newTag);
    tn.val('');
    tv.val('');
};

/**
 * remove selected tag
 */
const removeTag = (id) => {
    $('#tag_ticket_' + id).remove();
    thisIngestion.pipeline.tags = thisIngestion.pipeline.tags.filter((e) => { return e.id != id; });
    console.log('thisIngestion.pipeline.tags', thisIngestion.pipeline.tags);
};