import { ScheduleObservable } from '../lib/observable-schedule';

describe('ScheduleObservable', () => {

    it('should be defined', () => {
        const instance = new ScheduleObservable('* * * 1 *');

        expect(instance).toBeDefined();
    });

    it('first subscribe should trigger start watching', () => {
        const instance = new ScheduleObservable('* * * 1 *');

        instance.subscribe();

        expect(instance._job).toBeDefined();
        expect(instance._job.pendingInvocations().length).toEqual(1);
    });

    it('second subscribe should not trigger second watching', () => {
        const instance = new ScheduleObservable('* * * 1 *');

        instance.subscribe();
        const originalJob = instance._job;
        instance.subscribe();

        expect(instance._job).toBeDefined();
        expect(instance._job).toBe(originalJob);
        expect(instance._job.pendingInvocations().length).toEqual(1);

    });

    it('should not stop watching if observable has subscribers', () => {
        const instance = new ScheduleObservable('* * * 1 *');

        instance.subscribe();
        const sub2 = instance.subscribe();

        spyOn(instance._job, 'cancel');

        sub2.unsubscribe();

        expect(instance._job.cancel).not.toBeCalled();
    });

    it('should stop watching if observable has no subscribers', () => {
        const instance = new ScheduleObservable('* * * 1 *');

        const sub1 = instance.subscribe();
        const sub2 = instance.subscribe();

        spyOn(instance._job, 'cancel');

        sub1.unsubscribe();
        sub2.unsubscribe();

        expect(instance._job.cancel).toBeCalled();
    });

    it('should start watching (reschedule) after repeat subscribe', () => {
        const instance = new ScheduleObservable('* * * 1 *');

        instance.subscribe().unsubscribe();
        spyOn(instance._job, 'reschedule');
        instance.subscribe();

        expect(instance._job.reschedule).toBeCalled();
    });

    it('should stop watching after repeat subscribe and unsubscribe', () => {
        const instance = new ScheduleObservable('* * * 1 *');

        const sub1 = instance.subscribe();
        spyOn(instance._job, 'cancel');

        sub1.unsubscribe();
        instance.subscribe().unsubscribe();

        expect(instance._job.cancel).toBeCalledTimes(2);
    });

});
