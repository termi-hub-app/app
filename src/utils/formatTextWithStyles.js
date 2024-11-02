module.exports = function formatTextWithStyles(text) {
    return text
        .replace(/<red>/g, '<span class="red">')
        .replace(/<\/red>/g, '</span>')
        .replace(/<green>/g, '<span class="green">')
        .replace(/<\/green>/g, '</span>')
        .replace(/<yellow>/g, '<span class="yellow">')
        .replace(/<\/yellow>/g, '</span>')
        .replace(/<blue>/g, '<span class="blue">')
        .replace(/<\/blue>/g, '</span>')
        .replace(/<underline>/g, '<span class="underline">')
        .replace(/<\/underline>/g, '</span>')
        .replace(/<italic>/g, '<span class="italic">')
        .replace(/<\/italic>/g, '</span>')
        .replace(/<strong>/g, '<strong>')
        .replace(/<\/strong>/g, '</strong>')
        .replace(/<purple>/g, '<span class="purple">')
        .replace(/<\/purple>/g, '</span>');
};
