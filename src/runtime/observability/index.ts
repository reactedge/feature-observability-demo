import {getTracer, setupTelemetry} from "./telemetry.ts";
import {ACTIVITY_EVENT_NAME} from "../constants.ts";
import {flattenAttributes} from "./data-parser.ts";

export type ActivityEvent =
    CustomEvent<ActivityPayload>;

type Level = 'info' | 'warn' | 'error';
export interface ActivityPayload {
    widget: string;
    instance: string;
    phase: string;
    message: string;
    level: Level;
    data?: unknown;
    ts: number;
}


export function startObservability() {
    setupTelemetry();

    window.addEventListener(
        ACTIVITY_EVENT_NAME,
        (event) => {
            const payload =
                (event as ActivityEvent).detail;

            const span = getTracer().startSpan(
                `widget.${payload.widget}.${payload.phase}`
            );

            const attributes: Attributes = {
                'reactedge.widget': payload.widget,
                'reactedge.phase': payload.phase,
                'reactedge.level': payload.level
            };

            Object.assign(
                attributes,
                flattenAttributes(
                    'reactedge.data',
                    payload.data
                )
            );

            span.setAttributes(attributes);

            span.end();
        }
    );
}

interface WidgetContext {
    widget: string;
    instance: string;
}

const instances = new WeakMap<HTMLElement, WidgetContext>();

export function registerInstance(
    element: HTMLElement,
    context: WidgetContext
) {
    instances.set(element, context);
}

export function getInstance(
    element: HTMLElement
): WidgetContext | undefined {
    return instances.get(element);
}