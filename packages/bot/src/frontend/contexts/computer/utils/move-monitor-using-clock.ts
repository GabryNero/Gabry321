import { Injectable, Inject, DI } from 'di-xxl';

import { IDomObserver } from '../../../interfaces/dom-observer';

import { EventHub } from 'eventhub-xxl';

import { IBrowserSettings } from '../../../../models/browser-settings';

import { getS } from '../../../utils/find';
import { IMonitor } from '../../../../models/monitor';
import { EVENT_TYPES } from '../../../event-types';

@Injectable({ name: 'monitor.live.move-using-clock', singleton: true })
export class ComputerMoveMonitorClock implements IMonitor {
	private gameMoveObserver: IDomObserver;

	@Inject('eh') private eh: EventHub;
	@Inject('settings') settings: IBrowserSettings;

	cleanup = () => { };

	start(cb?: () => void,
		selector = `${this.settings.PLAYER_DETAILS} ${this.settings.CLOCK}`,
		deepCheck = false): IMonitor {
		this.stop();

		this.gameMoveObserver = DI.get<IDomObserver>('browser.dom.observer').observe(selector, (mutation) => {
			console.log('99999 mutation detected', this.gameMoveObserver);
			cb ? cb() : this.handleMutations(mutation);
		}, deepCheck ? { subtree: true, childList: true, attributes: true } :
			{ subtree: false, childList: false, attributes: true });
		this.handleMutations(getS(selector))

		return this;
	}

	private handleMutations(mutation: HTMLElement): void {
		if (mutation === null) {
			return;
		}

		if (!mutation.classList.contains(this.settings.CLOCK_INACTIVE)) {
			this.eh.trigger(EVENT_TYPES.MOVE_START);
		} else {
			this.eh.trigger(EVENT_TYPES.MOVE_END);
		}
	}

	stop(): void {
		this.gameMoveObserver && this.gameMoveObserver.disconnect();
	}
}
