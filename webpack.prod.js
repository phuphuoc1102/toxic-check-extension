import { merge } from 'webpack-merge';
import common from './webpack.config.mjs';

module.exports = merge(common, {
  mode: 'production',
});
