import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@monopoly/shared': '/packages/shared/src',
          '@monopoly/game-engine': '/packages/game-engine/src',
          '@monopoly/rules-engine': '/packages/rules-engine/src',
          '@monopoly/networking': '/packages/networking/src',
          '@monopoly/modding': '/packages/modding/src',
          '@monopoly/ui-components': '/packages/ui-components/src',
        },
      },
    };
  },
};

export default config;