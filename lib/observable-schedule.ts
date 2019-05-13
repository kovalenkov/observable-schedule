import { Observable, Subject } from 'rxjs';
import {
    Job,
    RecurrenceRule,
    RecurrenceSpecDateRange,
    RecurrenceSpecObjLit,
    rescheduleJob,
    scheduleJob,
} from 'node-schedule';
import { Subscriber } from 'rxjs/internal/Subscriber';
import { TeardownLogic } from 'rxjs/internal/types';

type JobResult = Date;

export class ScheduleObservable extends Observable<JobResult> {
    _job: Job;
    _rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string;
    _output = new Subject<JobResult>();

    constructor(rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string) {
        super();
        this._rule = rule
    }

    /** @deprecated This is an internal implementation detail, do not use. */
    _subscribe(subscriber: Subscriber<JobResult>): TeardownLogic {

        const { source } = this;

        if (source) {
            return source.subscribe(subscriber)
        }

        if (!this._job || this._job.pendingInvocations.length === 0) {
            this._startJob();
        }

        this._output.subscribe(subscriber);

        subscriber.add(() => {
            if (this._output.observers.length === 0) {
                this._job.cancel();
                this._output = new Subject<JobResult>();
            }
        });

        return subscriber;
    }

    _startJob() {
        if (this._job) {
            rescheduleJob(this._job, this._rule);
        } else {
            this._job = scheduleJob(this._rule, (fireDate: Date) => {
                this._output.next(fireDate);
            });
        }
    }

}
