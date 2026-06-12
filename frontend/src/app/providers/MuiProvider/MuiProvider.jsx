import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FEB7FF',
      contrastText: '#151515',
    },
    secondary: {
      main: '#222222',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff4444',
      contrastText: '#ffffff',
    },
    background: {
      default: '#151515',
      paper: '#222222',
    },
    text: {
      primary: '#ffffff',
      secondary: '#d7d7d7',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          fontWeight: 700,
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#222222',
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#333333',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#555555',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FEB7FF',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#222222',
          color: '#ffffff',
          borderRadius: 12,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#151515',
          color: '#ffffff',
        },
      },
    },
  },
});

const MuiProvider = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

export default MuiProvider;
