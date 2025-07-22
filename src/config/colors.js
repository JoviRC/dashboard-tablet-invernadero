// ColorHelpers para sensores y estados
export const ColorHelpers = {
  getSensorColor: (status, theme) => {
    switch (status) {
      case 'optimal':
      case 'good':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'critical':
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  }
};
