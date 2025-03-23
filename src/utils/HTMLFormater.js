module.exports = function formatText(text) {
    // First handle custom tags, but ignore anything inside <...>
    let parts = text.split(/(<[^>]*>)/g);
    let result = parts.map(part => {
        // If it's an HTML tag, leave it untouched
        /*if (part.startsWith('<') && part.endsWith('>')) {
            return part;
        }*/
        // Otherwise, process our custom tags
        return part
            .replace(/%%%bold%%%/g, '<strong>')
            .replace(/%%%!bold%%%/g, '</strong>')
            .replace(/%%%lime%%%/g, '<span class="lime">')
            .replace(/%%%!lime%%%/g, '</span>')
            .replace(/%%%italic%%%/g, '<span class="italic">')
            .replace(/%%%!italic%%%/g, '</span>')
            .replace(/%%%gray%%%/g, '<span class="gray">')
            .replace(/%%%!gray%%%/g, '</span>')
            .replace(/%%%red%%%/g, '<span class="red">')
            .replace(/%%%!red%%%/g, '</span>')
            .replace(/%%%green%%%/g, '<span class="green">')
            .replace(/%%%!green%%%/g, '</span>')
            .replace(/%%%yellow%%%/g, '<span class="yellow">')
            .replace(/%%%!yellow%%%/g, '</span>')
            .replace(/%%%blue%%%/g, '<span class="blue">')
            .replace(/%%%!blue%%%/g, '</span>')
            .replace(/%%%underline%%%/g, '<span class="underline">')
            .replace(/%%%!underline%%%/g, '</span>')
            .replace(/%%%black%%%/g, '<span class="black">')
            .replace(/%%%!black%%%/g, '</span>')
            .replace(/%%%white%%%/g, '<span class="white">')
            .replace(/%%%!white%%%/g, '</span>')
            .replace(/%%%cyan%%%/g, '<span class="cyan">')
            .replace(/%%%!cyan%%%/g, '</span>')
            .replace(/%%%pink%%%/g, '<span class="pink">')
            .replace(/%%%!pink%%%/g, '</span>')
            .replace(/%%%orange%%%/g, '<span class="orange">')
            .replace(/%%%!orange%%%/g, '</span>')
            .replace(/%%%purple%%%/g, '<span class="purple">')
            .replace(/%%%!purple%%%/g, '</span>')
            .replace(/%%%magenta%%%/g, '<span class="magenta">')
            .replace(/%%%!magenta%%%/g, '</span>')
            .replace(/%%%brown%%%/g, '<span class="brown">')
            .replace(/%%%!brown%%%/g, '</span>')
            .replace(/%%%indigo%%%/g, '<span class="indigo">')
            .replace(/%%%!indigo%%%/g, '</span>')
            .replace(/%%%teal%%%/g, '<span class="teal">')
            .replace(/%%%!teal%%%/g, '</span>')
            .replace(/%%%maroon%%%/g, '<span class="maroon">')
            .replace(/%%%!maroon%%%/g, '</span>')
            .replace(/%%%olive%%%/g, '<span class="olive">')
            .replace(/%%%!olive%%%/g, '</span>')
            .replace(/%%%navy%%%/g, '<span class="navy">')
            .replace(/%%%!navy%%%/g, '</span>')
            .replace(/%%%turquoise%%%/g, '<span class="turquoise">')
            .replace(/%%%!turquoise%%%/g, '</span>')
            .replace(/%%%violet%%%/g, '<span class="violet">')
            .replace(/%%%!violet%%%/g, '</span>')
            .replace(/%%%yellowgreen%%%/g, '<span class="yellowgreen">')
            .replace(/%%%!yellowgreen%%%/g, '</span>')
            .replace(/%%%coral%%%/g, '<span class="coral">')
            .replace(/%%%!coral%%%/g, '</span>')
            .replace(/%%%salmon%%%/g, '<span class="salmon">')
            .replace(/%%%!salmon%%%/g, '</span>')
            .replace(/%%%gold%%%/g, '<span class="gold">')
            .replace(/%%%!gold%%%/g, '</span>')
            .replace(/%%%silver%%%/g, '<span class="silver">')
            .replace(/%%%!silver%%%/g, '</span>')
            .replace(/%%%crimson%%%/g, '<span class="crimson">')
            .replace(/%%%!crimson%%%/g, '</span>')
            .replace(/%%%plum%%%/g, '<span class="plum">')
            .replace(/%%%!plum%%%/g, '</span>')
            .replace(/%%%lavender%%%/g, '<span class="lavender">')
            .replace(/%%%!lavender%%%/g, '</span>')
            .replace(/%%%beige%%%/g, '<span class="beige">')
            .replace(/%%%!beige%%%/g, '</span>')
            .replace(/%%%khaki%%%/g, '<span class="khaki">')
            .replace(/%%%!khaki%%%/g, '</span>')
            .replace(/%%%ivory%%%/g, '<span class="ivory">')
            .replace(/%%%!ivory%%%/g, '</span>')
            .replace(/%%%azure%%%/g, '<span class="azure">')
            .replace(/%%%!azure%%%/g, '</span>')
            .replace(/%%%linen%%%/g, '<span class="linen">')
            .replace(/%%%!linen%%%/g, '</span>')
            .replace(/%%%snow%%%/g, '<span class="snow">')
            .replace(/%%%!snow%%%/g, '</span>');
    }).join('');

    // Handle line breaks
    result = result.replace(/\n/g, '<br>');

    // Finally handle URLs, but only those not already in HTML tags
    return result.replace(
        /(?![^<]*>)(https?:\/\/[^\s<>"]+)(?![^<]*>)/g,
        '<span class="terminal-link" data-url="$1">$1</span>'
    );
};
