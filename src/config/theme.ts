import type { ThemeConfig } from 'antd';

const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    colorBgLayout: '#f0f2f5',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
      bodyBg: '#f0f2f5',
      triggerBg: '#002140',
      triggerColor: '#ffffff',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1677ff',
      darkSubMenuItemBg: '#000c17',
    },
    Card: {
      paddingLG: 20,
    },
    Table: {
      headerBg: '#fafafa',
    },
    Badge: {
      dotSize: 8,
    },
  },
};

const darkTheme: ThemeConfig = {
  algorithm: undefined,
  token: {
    colorPrimary: '#1668dc',
    colorSuccess: '#49aa19',
    colorWarning: '#d89614',
    colorError: '#dc4446',
    colorInfo: '#1668dc',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    colorBgLayout: '#000000',
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.16), 0 1px 6px -1px rgba(0, 0, 0, 0.12)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.24)',
  },
  components: {
    Layout: {
      siderBg: '#000000',
      headerBg: '#141414',
      bodyBg: '#000000',
      triggerBg: '#1f1f1f',
      triggerColor: 'rgba(255, 255, 255, 0.85)',
    },
    Menu: {
      darkItemBg: '#000000',
      darkItemSelectedBg: '#1668dc',
      darkSubMenuItemBg: '#141414',
    },
    Card: {
      paddingLG: 20,
    },
    Table: {
      headerBg: '#1f1f1f',
    },
    Badge: {
      dotSize: 8,
    },
  },
};

export { lightTheme, darkTheme };
export type { ThemeConfig };
