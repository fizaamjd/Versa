'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Archivo is loaded once in the root layout and exposed as --font-archivo.
const fontFamily = 'var(--font-archivo), ui-sans-serif, system-ui, sans-serif';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2346D9',
            light: '#4F6CE1',
            dark: '#162D8F',
            contrastText: '#ffffff',
        },
        text: {
            primary: '#101418',
            secondary: '#4A5260',
        },
        divider: '#E3E6EB',
        warning: {
            main: '#F2B705',
            contrastText: '#101418',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily,
        h1: { fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em' },
        h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' },
        h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
        h4: { fontSize: '1.25rem', fontWeight: 600 },
        h5: { fontSize: '1.1rem', fontWeight: 600 },
        h6: { fontSize: '0.95rem', fontWeight: 600 },
        subtitle1: { fontSize: '0.9rem', fontWeight: 500 },
        subtitle2: { fontSize: '0.8rem', fontWeight: 500 },
        body1: { fontSize: '0.85rem', fontWeight: 400 },
        body2: { fontSize: '0.75rem', fontWeight: 400 },
        button: { fontSize: '0.85rem', fontWeight: 600, textTransform: 'none' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '4px',
                    padding: '8px 16px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '3px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '6px',
                    border: '1px solid #E3E6EB',
                    boxShadow: '0 1px 2px rgba(16, 20, 24, 0.04)',
                }
            }
        }
    },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const [{ cache, flush }] = React.useState(() => {
        const cache = createCache({ key: 'mui', prepend: true });
        cache.compat = true;

        const prevInsert = cache.insert;
        let inserted: string[] = [];
        cache.insert = (...args: Parameters<typeof cache.insert>) => {
            const serialized = args[1];
            if (cache.inserted[serialized.name] === undefined) {
                inserted.push(serialized.name);
            }
            return prevInsert.apply(cache, args);
        };

        const flush = () => {
            const prev = inserted;
            inserted = [];
            return prev;
        };

        return { cache, flush };
    });

    useServerInsertedHTML(() => {
        const names = flush();
        if (names.length === 0) return null;

        let styles = '';
        for (const name of names) {
            styles += cache.inserted[name];
        }

        return (
            <style
                data-emotion={`${cache.key} ${names.join(' ')}`}

                dangerouslySetInnerHTML={{ __html: styles }}
            />
        );
    });

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </CacheProvider>
    );
}
