import { merge } from 'webpack-merge';
import common from './webpack.config.mjs';

export default merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
});
