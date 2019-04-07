module.exports = ({ env }) => ({
  plugins: {
    'postcss-import': true,

    'postcss-nested-ancestors': true,

    precss: {
      stage: 0,
      autoprefixer: env === 'production',
    },

    'css-mqpacker': env === 'production',

    'postcss-sorting': {
      order: [
        'custom-properties',
        'dollar-variables',
        'declarations',
        'at-rules',
        'rules',
      ],

      'properties-order': 'alphabetical',

      'unspecified-properties-position': 'bottom',
    },

    cssnano: env === 'production',
  },
});
