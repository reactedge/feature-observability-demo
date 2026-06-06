import type { WidgetConfig } from "../Config";
import {useEffect, useState} from "react";
import type {WidgetState} from "../types/feature-observability.types.ts";
import {useActivityContext} from "../activity/Context/useActivityContext.ts";

export interface WidgetProps {
    readonly config: WidgetConfig;
    readonly onStable?: () => void;
}
export const Widget = ({ config, onStable }: WidgetProps) => {
    const activity = useActivityContext();

    const [state, setState] = useState<WidgetState>({
        searchTerm: '',
        status: 'idle'
    });

    useEffect(() => {
        onStable?.();
    }, [onStable]);

    async function handleSearch() {
        const searchTerm = state.searchTerm.trim();

        if (!searchTerm) {
            return;
        }

        const operation = activity.startOperation(
            'search',
            {searchTerm}
        );

        try {
            await new Promise(
                resolve => setTimeout(resolve, 1000)
            );

            if (searchTerm === 'error') {
                throw new Error('Search backend unavailable');
            }

            const resultCount = searchTerm.length * 3;

            activity.endOperation(
                operation,
                {
                    resultCount
                }
            );

            setState(previous => ({
                ...previous,
                status: 'success'
            }));
        } catch (error) {
            activity.failOperation(
                operation,
                {
                    error: error instanceof Error
                        ? error.message
                        : 'Unknown error'
                }
            );

            setState(previous => ({
                ...previous,
                status: 'error'
            }));
        }
    }

    return (
        <div className="search-form">
            <h1 className="search-form__title">What search do you want to perform?</h1>
            <form
                className="observable-widget__form"
                onSubmit={(event) => {
                    event.preventDefault();
                    void handleSearch();
                }}
            >
                <input
                    value={state.searchTerm}
                    placeholder={config.data.placeholder}
                    onChange={(event) =>
                        setState((previous) => ({
                            ...previous,
                            searchTerm: event.target.value
                        }))
                    }
                />

                <button
                    type="submit"
                    disabled={state.status === 'searching'}
                >
                    {
                        state.status === 'searching'
                            ? 'Searching...'
                            : 'Search'
                    }
                </button>
            </form>
            <p className="observable-widget__status">
                Status: {state.status}
            </p>
        </div>
    )
};