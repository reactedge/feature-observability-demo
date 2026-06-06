import { isActivityEnabled } from './activity.guard';
import {ACTIVITY_EVENT_NAME} from "../runtime/constants.ts";

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

export interface Activity {
    log(
        phase: string,
        message: string,
        data?: unknown,
        level?: Level
    ): void;
}

export interface Operation {
    id: string;
    name: string;
    startedAt: number;
    data?: Record<string, unknown>;
}

export class WidgetActivity
    implements Activity {

    private readonly widget: string;
    private readonly instance?: string;

    constructor(
        widget: string,
        instance?: string
    ) {
        this.widget = widget;
        this.instance = instance;
    }

    public startOperation(
        name: string,
        data: Record<string, unknown> = {}
    ): Operation {
        const operation: Operation = {
            id: crypto.randomUUID(),
            name,
            startedAt: performance.now(),
            data
        };

        this.log(
            `${name}.started`,
            `${name} started`,
            {
                operationId: operation.id,
                ...data
            }
        );

        return operation;
    }

    public endOperation(
        operation: Operation,
        data: Record<string, unknown> = {}
    ): void {

        const durationMs =
            performance.now() - operation.startedAt;

        this.log(
            `${operation.name}.completed`,
            `${operation.name} completed`,
            {
                operationId: operation.id,
                durationMs,
                ...operation.data,
                ...data
            }
        );
    }

    public failOperation(
        operation: Operation,
        data: Record<string, unknown> = {}
    ): void {
        const duration = Date.now() - operation.startedAt;

        this.log(
            `${operation.name}.failed`,
            `${operation.name} failed`,
            {
                operationId: operation.id,
                duration,
                ...data
            },
            'error'
        );
    }

    public log(
        phase: string,
        message: string,
        data?: unknown,
        level: Level = 'info'
    ): void {
        const payload: ActivityPayload = {
            widget: this.widget,
            instance: this.instance ?? this.widget,
            phase,
            message,
            level,
            data,
            ts: Date.now(),
        };

        if (isActivityEnabled()) {
            const prefix =
                `[${this.widget}] ${phase}`;

            if (level === 'error') {
                console.error(prefix, payload);
            } else if (level === 'warn') {
                console.warn(prefix, payload);
            } else {
                console.log(prefix, payload);
            }
        }

        this.dispatchActivityEvent(payload);
    }

    private dispatchActivityEvent(
        payload: ActivityPayload
    ): void {

        if (typeof window === 'undefined') {
            return;
        }

        window.dispatchEvent(
            new CustomEvent(
                ACTIVITY_EVENT_NAME,
                {
                    detail: payload,
                }
            )
        );
    }
}
