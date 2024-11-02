const path = require('path');
const formatTextWithStyles = require(path.join(__dirname, 'src/utils/formatTextWithStyles.js'));

export function echo(args) {
    return args.join(' ') + '\n';
  }
  