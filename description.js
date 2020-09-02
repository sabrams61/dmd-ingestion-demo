/**
 * update tags in thisIngestion
 * @{id} id of the tag
 * @{selected} true if selected, false if removed
 * @{ignoreThisIngestion} if true, don't update thisIngestion
 */
const updateTags = (id, selected, ignoreThisIngestion) => {
    console.log('id, selected, ignoreThisIngestion', id, selected, ignoreThisIngestion);
    if (selected) {
        let newTag = availableTags.find((e) => { return e.id == id; });
        console.log('newTag', newTag);
        let newTicket = $('<div class="tag-ticket" id="tag_ticket_' + id + '"><span>' + newTag.name + ' [' + newTag.value + ']</span> <i class="fas fa-times-circle" title="Remove" onClick="updateTags(\'' + newTag.id + '\', false)"></i></div>');
        $('#selected-tags').append(newTicket);
        availableTags = availableTags.filter((e) => { return e.id != id; });
        selectedTags.push(newTag);
        if (!ignoreThisIngestion) {
            thisIngestion.pipeline.tags.push(parseInt(id));
        }
        console.log('thisIngestion.pipeline.tags', thisIngestion.pipeline.tags);
        buildTagsChoiceList();
    } else {
        let oldTag = selectedTags.find((e) => { return e.id == id; });
        availableTags.push(oldTag);
        $('#tag_ticket_' + id).remove();
        buildTagsChoiceList();
        thisIngestion.pipeline.tags = thisIngestion.pipeline.tags.filter((e) => { return e != id; });
        console.log('thisIngestion.pipeline.tags', thisIngestion.pipeline.tags);
    }
};

const buildTagsChoiceList = () => {
    const tagChoices = $('#tag-choices');
    tagChoices.html('');
    availableTags.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    availableTags.map((option) => {
        let opt = $('<option value="' + option.id + '">' + option.name + ' [' + option.value + ']</option>');
        tagChoices.append(opt);
    });
}

/**
 * add a new tag to options list and select it
 */
const addNewTag = () => {
    let tn = $('#add-tag-name');
    let tv = $('#add-tag-value');
    const newTag = {
        id : Math.floor(Math.random() * 1001),
        name : tn.val(),
        value: tv.val()
    };
    tagOptions.push(newTag);
    updateTags(newTag.id, true);
    tn.val('');
    tv.val('');
};