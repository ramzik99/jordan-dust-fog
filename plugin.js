const __pluginConfig =  {
  "name": "windy-plugin-jordan-dust-fog",
  "version": "0.1.0",
  "icon": "🌫️",
  "title": "Jordan Dust & Fog",
  "description": "Experimental GEOS-FP dust guidance for Jordan. Fog and satellite integration pending.",
  "author": "Ramzi Kandah",
  "repository": "https://github.com/ramzik99/jordan-dust-fog",
  "desktopUI": "embedded",
  "mobileUI": "small",
  "addToContextmenu": true,
  "listenToSingleclick": true,
  "built": 1792238717870,
  "builtReadable": "2026-10-17T12:05:17.870Z"
};

// transformCode: import { map } from '@windy/map';
const { map } = W.map;

// transformCode: import store from '@windy/store';
const store = W.store;

// transformCode: import { register, release, singleclick } from '@windy/singleclick';
const { register, release, singleclick } = W.singleclick;


/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @returns {Text} */
function empty() {
	return text('');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function set_input_value(input, value) {
	input.value = value == null ? '' : value;
}

/**
 * @returns {void} */
function select_option(select, value, mounting) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
	{
		select.selectedIndex = -1; // no option should be selected
	}
}

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	// The `!!` is required because an `undefined` flag means flipping the current state.
	element.classList.toggle(name, !!toggle);
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs/svelte#ondestroy
 * @param {() => any} fn
 * @returns {void}
 */
function onDestroy(fn) {
	get_current_component().$$.on_destroy.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

const config = {
    name: 'windy-plugin-jordan-dust-fog'};

const MAX_RUN_AGE_MS = 36 * 3600000;
const FIELDS = ['dustSurface', 'dustFine', 'dustAod'];
const validDate = value => typeof value === 'string' && value.endsWith('Z') && Number.isFinite(Date.parse(value));
function increasing(values) {
  return Array.isArray(values) && values.length > 0 && values.every((v, i) =>
    Number.isFinite(v) && (i === 0 || v > values[i - 1]));
}
function validateForecast(data, now = Date.now()) {
  if (!data || data.schemaVersion !== 1 || data.source !== 'NASA GEOS-FP') throw Error('Unsupported forecast format');
  if (!validDate(data.runTime) || !validDate(data.retrievedAt)) throw Error('Invalid source timestamps');
  const run = Date.parse(data.runTime);
  if (run > now + 3600000 || now - run > MAX_RUN_AGE_MS) throw Error('GEOS forecast run is stale or invalid');
  if (Date.parse(data.retrievedAt) > now + 3600000 || Date.parse(data.retrievedAt) < run) throw Error('Invalid retrieval time');
  if (!increasing(data.latitudes) || !increasing(data.longitudes) || data.latitudes.length < 2 || data.longitudes.length < 2) throw Error('Invalid spatial grid');
  if (data.latitudes[0] < -90 || data.latitudes.at(-1) > 90 || data.longitudes[0] < -180 || data.longitudes.at(-1) > 180) throw Error('Invalid coordinates');
  if (data.units?.dustSurface !== 'ug m-3' || data.units?.dustFine !== 'ug m-3' || data.units?.dustAod !== '1') throw Error('Unexpected units');
  if (!Array.isArray(data.frames) || !data.frames.length || data.frames.length > 100) throw Error('Invalid forecast frames');
  if (data.latitudes.length * data.longitudes.length > 10000) throw Error('Forecast grid exceeds regional limit');
  let lastEnd = -Infinity;
  for (const f of data.frames) {
    if (![f.start, f.end, f.validTime].every(validDate)) throw Error('Invalid frame times');
    const start = Date.parse(f.start), end = Date.parse(f.end), centre = Date.parse(f.validTime);
    if (start < run || start < lastEnd || end - start !== 10800000 || centre !== (start + end) / 2) throw Error('Invalid or overlapping averaging intervals');
    lastEnd = end;
    for (const key of FIELDS) {
      if (!Array.isArray(f[key]) || f[key].length !== data.latitudes.length ||
        f[key].some(row => !Array.isArray(row) || row.length !== data.longitudes.length ||
          row.some(v => v !== null && (!Number.isFinite(v) || v < 0)))) throw Error('Invalid field: ' + key);
    }
  }
  if (lastEnd <= now) throw Error('Forecast has expired');
  return data;
}
function frameAt(data, timestamp) {
  if (!Number.isFinite(timestamp)) return null;
  return data?.frames.find(f => timestamp >= Date.parse(f.start) && timestamp < Date.parse(f.end)) ?? null;
}
function samplePoint(data, frame, lat, lon) {
  if (!frame || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const ys = data.latitudes, xs = data.longitudes;
  if (lat < ys[0] || lat > ys.at(-1) || lon < xs[0] || lon > xs.at(-1)) return null;
  const nearest = (a, value) => a.reduce((best, v, i) => Math.abs(v - value) < Math.abs(a[best] - value) ? i : best, 0);
  const y = nearest(ys, lat), x = nearest(xs, lon);
  return { lat: ys[y], lon: xs[x], ...Object.fromEntries(FIELDS.map(k => [k, frame[k][y][x]])) };
}
// Display bins only: not visibility thresholds, health limits or calibrated warning levels.
const DUST_BINS = [
  { min: 0, color: '#fde0a3' }, { min: 100, color: '#f9a825' },
  { min: 300, color: '#e36c23' }, { min: 1000, color: '#b64231' },
];
function dustColor(value) {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  return DUST_BINS.findLast(b => value >= b.min).color;
}

/* src/pluginEntry.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-l83tf1", ".panel.svelte-l83tf1.svelte-l83tf1,.restore.svelte-l83tf1.svelte-l83tf1{position:fixed;left:12px;bottom:95px;z-index:1100;background:#142536;color:#f0f5f8;border:1px solid #42586b;border-radius:14px;box-shadow:0 8px 28px #0005;font:13px/1.5 system-ui,sans-serif}.panel.svelte-l83tf1.svelte-l83tf1{width:290px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 180px);overflow:auto;padding:16px;box-sizing:border-box}.restore.svelte-l83tf1.svelte-l83tf1{padding:12px}header.svelte-l83tf1.svelte-l83tf1{display:flex;justify-content:space-between;gap:10px}header.svelte-l83tf1 strong.svelte-l83tf1{font-size:17px}small.svelte-l83tf1.svelte-l83tf1{display:block;font-size:11px;color:#bbcad6}button.svelte-l83tf1.svelte-l83tf1,select.svelte-l83tf1.svelte-l83tf1{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:7px;padding:5px 8px;cursor:pointer}button.svelte-l83tf1.svelte-l83tf1:disabled{opacity:.5;cursor:default}button.svelte-l83tf1.svelte-l83tf1:focus-visible,select.svelte-l83tf1.svelte-l83tf1:focus-visible{outline:2px solid #f9a825;outline-offset:2px}.controls.svelte-l83tf1.svelte-l83tf1{display:flex;align-items:center;justify-content:space-between;margin:14px 0;gap:5px}label.svelte-l83tf1.svelte-l83tf1{display:flex;align-items:center;gap:4px}.place.svelte-l83tf1.svelte-l83tf1{justify-content:space-between;margin-bottom:5px}.reading.svelte-l83tf1.svelte-l83tf1{background:#21384a;border-radius:10px;padding:12px;margin:12px 0}.reading.svelte-l83tf1>strong.svelte-l83tf1{display:block;font-size:28px}.reading.svelte-l83tf1 strong small.svelte-l83tf1{display:inline;font-size:14px}.reading.svelte-l83tf1 span.svelte-l83tf1{font-size:12px}dl.svelte-l83tf1.svelte-l83tf1{margin:10px 0}dl.svelte-l83tf1>div.svelte-l83tf1{display:flex;justify-content:space-between;gap:8px;margin:5px 0}dt.svelte-l83tf1.svelte-l83tf1{font-size:11px;color:#bbcad6}dd.svelte-l83tf1.svelte-l83tf1{margin:0;font-size:12px}.legend.svelte-l83tf1.svelte-l83tf1{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin:14px 0 3px}.legend.svelte-l83tf1 span.svelte-l83tf1{border-top:7px solid var(--color);padding-top:3px;font-size:10px}.pending.svelte-l83tf1.svelte-l83tf1{display:grid;grid-template-columns:1fr auto;gap:6px;border-top:1px solid #42586b;margin-top:12px;padding-top:12px;font-size:12px}.pending.svelte-l83tf1 span.svelte-l83tf1{color:#bbcad6}.error.svelte-l83tf1.svelte-l83tf1{background:#692f30;padding:9px;border-radius:7px;font-size:12px}details.svelte-l83tf1.svelte-l83tf1{margin-top:12px}summary.svelte-l83tf1.svelte-l83tf1{cursor:pointer;font-size:12px}details.svelte-l83tf1 p.svelte-l83tf1{font-size:11px;color:#bbcad6}a.svelte-l83tf1.svelte-l83tf1{color:#ffd486}.timeline.svelte-l83tf1.svelte-l83tf1{display:flex;gap:5px;flex-wrap:wrap;max-height:180px;overflow:auto;margin-top:8px}.timeline.svelte-l83tf1 button.svelte-l83tf1{font-size:10px}.timeline.svelte-l83tf1 .active.svelte-l83tf1{border-color:#f9a825}footer.svelte-l83tf1.svelte-l83tf1{font-size:10px;color:#bbcad6;border-top:1px solid #42586b;margin-top:12px;padding-top:8px}@media(max-width:600px){.panel.svelte-l83tf1.svelte-l83tf1{bottom:100px;width:270px;max-height:55dvh}.restore.svelte-l83tf1.svelte-l83tf1{bottom:100px}}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[36] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[39] = list[i];
	return child_ctx;
}

// (151:0) {:else}
function create_else_block(ctx) {
	let section;
	let header;
	let div0;
	let t2;
	let button0;
	let t4;
	let div1;
	let label0;
	let input0;
	let t5;
	let t6;
	let label1;
	let input1;
	let t7;
	let t8;
	let button1;
	let t9_value = (/*loading*/ ctx[7] ? 'Loading…' : 'Refresh') + "";
	let t9;
	let button1_disabled_value;
	let t10;
	let t11;
	let t12;
	let label2;
	let t13;
	let select;
	let show_if = !/*places*/ ctx[10].some(/*func*/ ctx[19]);
	let if_block2_anchor;
	let select_value_value;
	let t14;
	let small1;
	let t15;
	let t16_value = /*selected*/ ctx[3].lat.toFixed(3) + "";
	let t16;
	let t17;
	let t18_value = /*selected*/ ctx[3].lon.toFixed(3) + "";
	let t18;
	let t19;
	let t20;
	let div2;
	let span0;
	let t22;
	let strong1;
	let t23_value = /*format*/ ctx[12](/*sample*/ ctx[9]?.dustSurface) + "";
	let t23;
	let t24;
	let t25;
	let dl;
	let div3;
	let dt0;
	let dd0;
	let t27_value = /*format*/ ctx[12](/*sample*/ ctx[9]?.dustFine) + "";
	let t27;
	let t28_value = (/*sample*/ ctx[9]?.dustFine != null ? ' µg/m³' : '') + "";
	let t28;
	let div4;
	let dt1;
	let dd1;
	let t30_value = /*format*/ ctx[12](/*sample*/ ctx[9]?.dustAod, 2) + "";
	let t30;
	let t31;
	let t32;
	let t33;
	let details0;
	let summary0;
	let t35;
	let t36;
	let div5;
	let t41;
	let details1;
	let t52;
	let mounted;
	let dispose;
	let if_block0 = /*error*/ ctx[8] && create_if_block_9(ctx);
	let if_block1 = /*stale*/ ctx[4] && create_if_block_8();
	let if_block2 = show_if && create_if_block_7(ctx);
	let each_value_1 = ensure_array_like(/*places*/ ctx[10]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	let if_block3 = /*sample*/ ctx[9]?.dustSurface != null && create_if_block_6();

	function select_block_type_1(ctx, dirty) {
		if (/*frame*/ ctx[5]) return create_if_block_5;
		return create_else_block_2;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block4 = current_block_type(ctx);
	let if_block5 = /*sample*/ ctx[9] && create_if_block_4(ctx);
	let if_block6 = /*showDust*/ ctx[2] && create_if_block_3();

	function select_block_type_2(ctx, dirty) {
		if (/*forecast*/ ctx[0] && !/*stale*/ ctx[4]) return create_if_block_2;
		return create_else_block_1;
	}

	let current_block_type_1 = select_block_type_2(ctx);
	let if_block7 = current_block_type_1(ctx);
	let if_block8 = /*forecast*/ ctx[0] && create_if_block_1(ctx);

	return {
		c() {
			section = element("section");
			header = element("header");
			div0 = element("div");
			div0.innerHTML = `<strong class="svelte-l83tf1">Jordan Dust &amp; Fog</strong><small class="svelte-l83tf1">Experimental · v0.1.0</small>`;
			t2 = space();
			button0 = element("button");
			button0.textContent = "−";
			t4 = space();
			div1 = element("div");
			label0 = element("label");
			input0 = element("input");
			t5 = text("On");
			t6 = space();
			label1 = element("label");
			input1 = element("input");
			t7 = text("Dust map");
			t8 = space();
			button1 = element("button");
			t9 = text(t9_value);
			t10 = space();
			if (if_block0) if_block0.c();
			t11 = space();
			if (if_block1) if_block1.c();
			t12 = space();
			label2 = element("label");
			t13 = text("Location\n      ");
			select = element("select");
			if (if_block2) if_block2.c();
			if_block2_anchor = empty();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t14 = space();
			small1 = element("small");
			t15 = text("Or click the map · ");
			t16 = text(t16_value);
			t17 = text("°N, ");
			t18 = text(t18_value);
			t19 = text("°E");
			t20 = space();
			div2 = element("div");
			span0 = element("span");
			span0.textContent = "Forecast surface dust";
			t22 = space();
			strong1 = element("strong");
			t23 = text(t23_value);
			if (if_block3) if_block3.c();
			t24 = space();
			if_block4.c();
			t25 = space();
			dl = element("dl");
			div3 = element("div");
			dt0 = element("dt");
			dt0.textContent = "Fine dust (PM₂.₅ component)";
			dd0 = element("dd");
			t27 = text(t27_value);
			t28 = text(t28_value);
			div4 = element("div");
			dt1 = element("dt");
			dt1.textContent = "Dust optical depth";
			dd1 = element("dd");
			t30 = text(t30_value);
			t31 = space();
			if (if_block5) if_block5.c();
			t32 = space();
			if (if_block6) if_block6.c();
			t33 = space();
			details0 = element("details");
			summary0 = element("summary");
			summary0.textContent = "Available forecast intervals";
			t35 = space();
			if_block7.c();
			t36 = space();
			div5 = element("div");
			div5.innerHTML = `<strong>Fog forecast</strong><span class="svelte-l83tf1">Not connected</span><strong>Satellite observations</strong><span class="svelte-l83tf1">Not connected</span>`;
			t41 = space();
			details1 = element("details");
			details1.innerHTML = `<summary class="svelte-l83tf1">Sources and interpretation</summary> <p class="svelte-l83tf1">NASA GEOS-FP · 0.25° latitude × 0.3125° longitude. The buffered region includes Jordan and neighbouring areas. Native grid cells and nearest-cell point values are shown.</p> <p class="svelte-l83tf1">Surface dust is modelled dust mass, not total PM₁₀. Optical depth represents the whole atmospheric column; it is not surface visibility.</p> <p class="svelte-l83tf1">No ground confirmation, calibrated alert thresholds or notifications are implemented in this first version. Satellite low cloud will require ground evidence to confirm fog.</p> <p class="svelte-l83tf1"><a href="https://view.eumetsat.int/" target="_blank" rel="noopener noreferrer" class="svelte-l83tf1">Open EUMETSAT imagery viewer ↗</a> (external viewer; imagery is not analysed by this plugin).</p>`;
			t52 = space();
			if (if_block8) if_block8.c();
			attr(button0, "title", "Minimize panel");
			attr(button0, "aria-label", "Minimize panel");
			attr(button0, "class", "svelte-l83tf1");
			attr(header, "class", "svelte-l83tf1");
			attr(input0, "type", "checkbox");
			attr(label0, "class", "svelte-l83tf1");
			attr(input1, "type", "checkbox");
			attr(label1, "class", "svelte-l83tf1");
			button1.disabled = button1_disabled_value = !/*enabled*/ ctx[1] || /*loading*/ ctx[7];
			attr(button1, "class", "svelte-l83tf1");
			attr(div1, "class", "controls svelte-l83tf1");
			attr(select, "class", "svelte-l83tf1");
			attr(label2, "class", "place svelte-l83tf1");
			attr(small1, "class", "svelte-l83tf1");
			attr(span0, "class", "svelte-l83tf1");
			attr(strong1, "class", "svelte-l83tf1");
			attr(div2, "class", "reading svelte-l83tf1");
			attr(dt0, "class", "svelte-l83tf1");
			attr(dd0, "class", "svelte-l83tf1");
			attr(div3, "class", "svelte-l83tf1");
			attr(dt1, "class", "svelte-l83tf1");
			attr(dd1, "class", "svelte-l83tf1");
			attr(div4, "class", "svelte-l83tf1");
			attr(dl, "class", "svelte-l83tf1");
			attr(summary0, "class", "svelte-l83tf1");
			attr(details0, "class", "svelte-l83tf1");
			attr(div5, "class", "pending svelte-l83tf1");
			attr(details1, "class", "svelte-l83tf1");
			attr(section, "class", "panel svelte-l83tf1");
			attr(section, "aria-label", "Jordan Dust and Fog");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, header);
			append(header, div0);
			append(header, t2);
			append(header, button0);
			append(section, t4);
			append(section, div1);
			append(div1, label0);
			append(label0, input0);
			input0.checked = /*enabled*/ ctx[1];
			append(label0, t5);
			append(div1, t6);
			append(div1, label1);
			append(label1, input1);
			input1.checked = /*showDust*/ ctx[2];
			append(label1, t7);
			append(div1, t8);
			append(div1, button1);
			append(button1, t9);
			append(section, t10);
			if (if_block0) if_block0.m(section, null);
			append(section, t11);
			if (if_block1) if_block1.m(section, null);
			append(section, t12);
			append(section, label2);
			append(label2, t13);
			append(label2, select);
			if (if_block2) if_block2.m(select, null);
			append(select, if_block2_anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*selected*/ ctx[3].name);
			append(section, t14);
			append(section, small1);
			append(small1, t15);
			append(small1, t16);
			append(small1, t17);
			append(small1, t18);
			append(small1, t19);
			append(section, t20);
			append(section, div2);
			append(div2, span0);
			append(div2, t22);
			append(div2, strong1);
			append(strong1, t23);
			if (if_block3) if_block3.m(strong1, null);
			append(div2, t24);
			if_block4.m(div2, null);
			append(section, t25);
			append(section, dl);
			append(dl, div3);
			append(div3, dt0);
			append(div3, dd0);
			append(dd0, t27);
			append(dd0, t28);
			append(dl, div4);
			append(div4, dt1);
			append(div4, dd1);
			append(dd1, t30);
			append(section, t31);
			if (if_block5) if_block5.m(section, null);
			append(section, t32);
			if (if_block6) if_block6.m(section, null);
			append(section, t33);
			append(section, details0);
			append(details0, summary0);
			append(details0, t35);
			if_block7.m(details0, null);
			append(section, t36);
			append(section, div5);
			append(section, t41);
			append(section, details1);
			append(section, t52);
			if (if_block8) if_block8.m(section, null);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler_1*/ ctx[21]),
					listen(input0, "change", /*input0_change_handler*/ ctx[22]),
					listen(input0, "change", /*toggleEnabled*/ ctx[14]),
					listen(input1, "change", /*input1_change_handler*/ ctx[23]),
					listen(button1, "click", /*load*/ ctx[15]),
					listen(select, "change", /*change_handler*/ ctx[24])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*enabled*/ 2) {
				input0.checked = /*enabled*/ ctx[1];
			}

			if (dirty[0] & /*showDust*/ 4) {
				input1.checked = /*showDust*/ ctx[2];
			}

			if (dirty[0] & /*loading*/ 128 && t9_value !== (t9_value = (/*loading*/ ctx[7] ? 'Loading…' : 'Refresh') + "")) set_data(t9, t9_value);

			if (dirty[0] & /*enabled, loading*/ 130 && button1_disabled_value !== (button1_disabled_value = !/*enabled*/ ctx[1] || /*loading*/ ctx[7])) {
				button1.disabled = button1_disabled_value;
			}

			if (/*error*/ ctx[8]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_9(ctx);
					if_block0.c();
					if_block0.m(section, t11);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*stale*/ ctx[4]) {
				if (if_block1) ; else {
					if_block1 = create_if_block_8();
					if_block1.c();
					if_block1.m(section, t12);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*selected*/ 8) show_if = !/*places*/ ctx[10].some(/*func*/ ctx[19]);

			if (show_if) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_7(ctx);
					if_block2.c();
					if_block2.m(select, if_block2_anchor);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*places*/ 1024) {
				each_value_1 = ensure_array_like(/*places*/ ctx[10]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if (dirty[0] & /*selected, places*/ 1032 && select_value_value !== (select_value_value = /*selected*/ ctx[3].name)) {
				select_option(select, /*selected*/ ctx[3].name);
			}

			if (dirty[0] & /*selected*/ 8 && t16_value !== (t16_value = /*selected*/ ctx[3].lat.toFixed(3) + "")) set_data(t16, t16_value);
			if (dirty[0] & /*selected*/ 8 && t18_value !== (t18_value = /*selected*/ ctx[3].lon.toFixed(3) + "")) set_data(t18, t18_value);
			if (dirty[0] & /*sample*/ 512 && t23_value !== (t23_value = /*format*/ ctx[12](/*sample*/ ctx[9]?.dustSurface) + "")) set_data(t23, t23_value);

			if (/*sample*/ ctx[9]?.dustSurface != null) {
				if (if_block3) ; else {
					if_block3 = create_if_block_6();
					if_block3.c();
					if_block3.m(strong1, null);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block4) {
				if_block4.p(ctx, dirty);
			} else {
				if_block4.d(1);
				if_block4 = current_block_type(ctx);

				if (if_block4) {
					if_block4.c();
					if_block4.m(div2, null);
				}
			}

			if (dirty[0] & /*sample*/ 512 && t27_value !== (t27_value = /*format*/ ctx[12](/*sample*/ ctx[9]?.dustFine) + "")) set_data(t27, t27_value);
			if (dirty[0] & /*sample*/ 512 && t28_value !== (t28_value = (/*sample*/ ctx[9]?.dustFine != null ? ' µg/m³' : '') + "")) set_data(t28, t28_value);
			if (dirty[0] & /*sample*/ 512 && t30_value !== (t30_value = /*format*/ ctx[12](/*sample*/ ctx[9]?.dustAod, 2) + "")) set_data(t30, t30_value);

			if (/*sample*/ ctx[9]) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block_4(ctx);
					if_block5.c();
					if_block5.m(section, t32);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}

			if (/*showDust*/ ctx[2]) {
				if (if_block6) ; else {
					if_block6 = create_if_block_3();
					if_block6.c();
					if_block6.m(section, t33);
				}
			} else if (if_block6) {
				if_block6.d(1);
				if_block6 = null;
			}

			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block7) {
				if_block7.p(ctx, dirty);
			} else {
				if_block7.d(1);
				if_block7 = current_block_type_1(ctx);

				if (if_block7) {
					if_block7.c();
					if_block7.m(details0, null);
				}
			}

			if (/*forecast*/ ctx[0]) {
				if (if_block8) {
					if_block8.p(ctx, dirty);
				} else {
					if_block8 = create_if_block_1(ctx);
					if_block8.c();
					if_block8.m(section, null);
				}
			} else if (if_block8) {
				if_block8.d(1);
				if_block8 = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(section);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			destroy_each(each_blocks, detaching);
			if (if_block3) if_block3.d();
			if_block4.d();
			if (if_block5) if_block5.d();
			if (if_block6) if_block6.d();
			if_block7.d();
			if (if_block8) if_block8.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (149:0) {#if hidden}
function create_if_block(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "🌫 Jordan Dust & Fog";
			attr(button, "class", "restore svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[20]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (160:4) {#if error}
function create_if_block_9(ctx) {
	let p;
	let t;

	return {
		c() {
			p = element("p");
			t = text(/*error*/ ctx[8]);
			attr(p, "class", "error svelte-l83tf1");
			attr(p, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*error*/ 256) set_data(t, /*error*/ ctx[8]);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (161:4) {#if stale}
function create_if_block_8(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Forecast expired or model run older than 36 hours. Layer hidden.";
			attr(p, "class", "error svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (164:8) {#if !places.some(p => p.name === selected.name)}
function create_if_block_7(ctx) {
	let option;
	let t_value = /*selected*/ ctx[3].name + "";
	let t;
	let option_value_value;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*selected*/ ctx[3].name;
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selected*/ 8 && t_value !== (t_value = /*selected*/ ctx[3].name + "")) set_data(t, t_value);

			if (dirty[0] & /*selected, places*/ 1032 && option_value_value !== (option_value_value = /*selected*/ ctx[3].name)) {
				option.__value = option_value_value;
				set_input_value(option, option.__value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(option);
			}
		}
	};
}

// (165:8) {#each places as place}
function create_each_block_1(ctx) {
	let option;
	let t_value = /*place*/ ctx[39].name + "";
	let t;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = /*place*/ ctx[39].name;
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(option);
			}
		}
	};
}

// (171:43) {#if sample?.dustSurface != null}
function create_if_block_6(ctx) {
	let small;

	return {
		c() {
			small = element("small");
			small.textContent = "µg/m³";
			attr(small, "class", "svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, small, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (173:6) {:else}
function create_else_block_2(ctx) {
	let small;

	let t_value = (/*enabled*/ ctx[1]
	? 'No supported forecast at the selected Windy time'
	: 'Plugin disabled') + "";

	let t;

	return {
		c() {
			small = element("small");
			t = text(t_value);
			attr(small, "class", "svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*enabled*/ 2 && t_value !== (t_value = (/*enabled*/ ctx[1]
			? 'No supported forecast at the selected Windy time'
			: 'Plugin disabled') + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (172:6) {#if frame}
function create_if_block_5(ctx) {
	let small;
	let t0_value = /*displayTime*/ ctx[11](/*frame*/ ctx[5].start) + "";
	let t0;
	let t1;
	let t2_value = /*displayTime*/ ctx[11](/*frame*/ ctx[5].end) + "";
	let t2;
	let t3;

	return {
		c() {
			small = element("small");
			t0 = text(t0_value);
			t1 = text(" – ");
			t2 = text(t2_value);
			t3 = text(" · 3-hour mean");
			attr(small, "class", "svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t0);
			append(small, t1);
			append(small, t2);
			append(small, t3);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*frame*/ 32 && t0_value !== (t0_value = /*displayTime*/ ctx[11](/*frame*/ ctx[5].start) + "")) set_data(t0, t0_value);
			if (dirty[0] & /*frame*/ 32 && t2_value !== (t2_value = /*displayTime*/ ctx[11](/*frame*/ ctx[5].end) + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (177:4) {#if sample}
function create_if_block_4(ctx) {
	let small;
	let t0;
	let t1_value = /*sample*/ ctx[9].lat.toFixed(3) + "";
	let t1;
	let t2;
	let t3_value = /*sample*/ ctx[9].lon.toFixed(3) + "";
	let t3;
	let t4;

	return {
		c() {
			small = element("small");
			t0 = text("Nearest GEOS cell: ");
			t1 = text(t1_value);
			t2 = text("°N, ");
			t3 = text(t3_value);
			t4 = text("°E");
			attr(small, "class", "svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t0);
			append(small, t1);
			append(small, t2);
			append(small, t3);
			append(small, t4);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*sample*/ 512 && t1_value !== (t1_value = /*sample*/ ctx[9].lat.toFixed(3) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*sample*/ 512 && t3_value !== (t3_value = /*sample*/ ctx[9].lon.toFixed(3) + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (178:4) {#if showDust}
function create_if_block_3(ctx) {
	let div;
	let small;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<span style="--color:#fde0a3" class="svelte-l83tf1">0–100</span><span style="--color:#f9a825" class="svelte-l83tf1">100–300</span> <span style="--color:#e36c23" class="svelte-l83tf1">300–1,000</span><span style="--color:#b64231" class="svelte-l83tf1">≥1,000</span> `;
			small = element("small");
			small.textContent = "µg/m³ · display bins, not warning levels · blank cells may be unknown";
			attr(div, "class", "legend svelte-l83tf1");
			attr(div, "aria-label", "Surface dust concentration scale");
			attr(small, "class", "svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			insert(target, small, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
				detach(small);
			}
		}
	};
}

// (185:19) {:else}
function create_else_block_1(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Forecast unavailable.";
			attr(p, "class", "svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (183:6) {#if forecast && !stale}
function create_if_block_2(ctx) {
	let div;
	let each_value = ensure_array_like(/*forecast*/ ctx[0].frames);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "timeline svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*frame, forecast, displayTime*/ 2081) {
				each_value = ensure_array_like(/*forecast*/ ctx[0].frames);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (183:52) {#each forecast.frames as item}
function create_each_block(ctx) {
	let button;
	let t0_value = /*displayTime*/ ctx[11](/*item*/ ctx[36].validTime) + "";
	let t0;
	let t1;
	let mounted;
	let dispose;

	function click_handler_2() {
		return /*click_handler_2*/ ctx[25](/*item*/ ctx[36]);
	}

	return {
		c() {
			button = element("button");
			t0 = text(t0_value);
			t1 = space();
			attr(button, "class", "svelte-l83tf1");
			toggle_class(button, "active", /*frame*/ ctx[5] === /*item*/ ctx[36]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			insert(target, t1, anchor);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_2);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*forecast*/ 1 && t0_value !== (t0_value = /*displayTime*/ ctx[11](/*item*/ ctx[36].validTime) + "")) set_data(t0, t0_value);

			if (dirty[0] & /*frame, forecast*/ 33) {
				toggle_class(button, "active", /*frame*/ ctx[5] === /*item*/ ctx[36]);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button);
				detach(t1);
			}

			mounted = false;
			dispose();
		}
	};
}

// (194:4) {#if forecast}
function create_if_block_1(ctx) {
	let footer;
	let t0;
	let t1_value = /*displayTime*/ ctx[11](/*forecast*/ ctx[0].runTime) + "";
	let t1;
	let br0;
	let t2;
	let t3_value = /*displayTime*/ ctx[11](/*forecast*/ ctx[0].retrievedAt) + "";
	let t3;
	let br1;
	let t4;

	return {
		c() {
			footer = element("footer");
			t0 = text("Run ");
			t1 = text(t1_value);
			br0 = element("br");
			t2 = text("Retrieved ");
			t3 = text(t3_value);
			br1 = element("br");
			t4 = text("Times use your device timezone.");
			attr(footer, "class", "svelte-l83tf1");
		},
		m(target, anchor) {
			insert(target, footer, anchor);
			append(footer, t0);
			append(footer, t1);
			append(footer, br0);
			append(footer, t2);
			append(footer, t3);
			append(footer, br1);
			append(footer, t4);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*forecast*/ 1 && t1_value !== (t1_value = /*displayTime*/ ctx[11](/*forecast*/ ctx[0].runTime) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*forecast*/ 1 && t3_value !== (t3_value = /*displayTime*/ ctx[11](/*forecast*/ ctx[0].retrievedAt) + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) {
				detach(footer);
			}
		}
	};
}

function create_fragment(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*hidden*/ ctx[6]) return create_if_block;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(if_block_anchor);
			}

			if_block.d(detaching);
		}
	};
}

const DATA_URL = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/main/data/latest.json';

function instance($$self, $$props, $$invalidate) {
	let stale;
	let frame;
	let sample;

	const places = [
		{ name: 'Amman', lat: 31.95, lon: 35.93 },
		{ name: 'Fuheis', lat: 32.01, lon: 35.77 },
		{ name: 'Irbid', lat: 32.56, lon: 35.85 },
		{ name: 'Mafraq', lat: 32.34, lon: 36.21 },
		{ name: 'Karak', lat: 31.18, lon: 35.70 },
		{ name: 'Ma’an', lat: 30.19, lon: 35.73 },
		{ name: 'Aqaba', lat: 29.53, lon: 35.01 },
		{
			name: 'Queen Alia',
			lat: 31.72,
			lon: 35.99
		}
	];

	let forecast = null;

	let enabled = true,
		showDust = true,
		hidden = false,
		loading = false,
		destroyed = false;

	let error = '', timestamp = Date.now(), now = Date.now();
	let selected = places[0];
	let overlay = null, pointer = null, request = null;
	let timer, refreshTimer, timestampListener;
	let generation = 0;

	const displayTime = value => new Date(value).toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	const format = (value, digits = 0) => value === null || value === undefined
	? 'Unavailable'
	: value.toFixed(digits);

	function clearOverlay() {
		if (overlay) {
			map.removeLayer(overlay);
			overlay = null;
		}
	}

	function renderDust(active, visible) {
		clearOverlay();
		if (!active || !visible || !forecast || typeof L === 'undefined') return;
		const pane = map.getPane('jordan-dust') || map.createPane('jordan-dust');
		pane.style.zIndex = '390';
		pane.style.pointerEvents = 'none';
		const next = L.layerGroup();
		const ys = forecast.latitudes, xs = forecast.longitudes;
		const dy = 0.125, dx = 0.15625;

		// Native model cells are deliberately visible; no artificial fine-scale detail.
		for (let y = 0; y < ys.length; y++) for (let x = 0; x < xs.length; x++) {
			const color = dustColor(active.dustSurface[y][x]);
			if (!color) continue;

			L.polygon(
				[
					[ys[y] - dy, xs[x] - dx],
					[ys[y] - dy, xs[x] + dx],
					[ys[y] + dy, xs[x] + dx],
					[ys[y] + dy, xs[x] - dx]
				],
				{
					pane: 'jordan-dust',
					stroke: false,
					fillColor: color,
					fillOpacity: 0.48,
					interactive: false
				}
			).addTo(next);
		}

		overlay = next.addTo(map);
	}

	function selectPoint(value) {
		const lat = value?.lat ?? value?.latitude ?? value?.latlng?.lat;
		const lon = value?.lon ?? value?.lng ?? value?.longitude ?? value?.latlng?.lng;
		if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon)) return;

		$$invalidate(3, selected = {
			name: value.name || 'Selected location',
			lat,
			lon
		});

		if (pointer) map.removeLayer(pointer);

		if (typeof L !== 'undefined') pointer = L.circleMarker([lat, lon], {
			radius: 6,
			color: '#fff',
			fillColor: '#183047',
			fillOpacity: 1,
			weight: 2
		}).addTo(map);
	}

	function toggleEnabled() {
		if (enabled) {
			register(config.name, 'high');
			if (!forecast) void load();
		} else {
			release(config.name, 'high');
			request?.abort();
			generation++;
			$$invalidate(7, loading = false);
			clearOverlay();

			if (pointer) {
				map.removeLayer(pointer);
				pointer = null;
			}
		}
	}

	async function load() {
		request?.abort();
		const abort = new AbortController();
		request = abort;
		const epoch = ++generation;
		$$invalidate(7, loading = true);
		$$invalidate(8, error = '');
		const timeout = setTimeout(() => abort.abort(), 20000);

		try {
			const response = await fetch(DATA_URL + '?t=' + Math.floor(Date.now() / 300000), { signal: abort.signal });

			if (!response.ok) throw Error(response.status === 404
			? 'Forecast file not yet available. Data ingestion must succeed first.'
			: 'Forecast server returned HTTP ' + response.status);

			const text = await response.text();
			if (text.length > 8000000) throw Error('Forecast file exceeds size limit');
			const loaded = validateForecast(JSON.parse(text));
			if (destroyed || epoch !== generation || !enabled) return;
			$$invalidate(0, forecast = loaded);
			$$invalidate(18, now = Date.now());
		} catch(err) {
			if (destroyed || epoch !== generation) return;

			$$invalidate(8, error = err?.name === 'AbortError'
			? 'Forecast request timed out or was cancelled.'
			: String(err?.message || err));

			// A failed refresh cannot leave a successful-looking obsolete layer.
			$$invalidate(0, forecast = null);

			clearOverlay();
		} finally {
			clearTimeout(timeout);
			if (epoch === generation) $$invalidate(7, loading = false);
		}
	}

	const onopen = params => {
		$$invalidate(6, hidden = false);
		if (enabled) register(config.name, 'high');
		selectPoint(params);
	};

	onMount(() => {
		singleclick.on(config.name, selectPoint);
		register(config.name, 'high');
		$$invalidate(17, timestamp = Number(store.get('timestamp')) || Date.now());

		timestampListener = store.on('timestamp', () => {
			$$invalidate(17, timestamp = Number(store.get('timestamp')));
		});

		timer = setInterval(
			() => {
				$$invalidate(18, now = Date.now());
			},
			60000
		);

		refreshTimer = setInterval(
			() => {
				if (enabled && !document.hidden && !loading) void load();
			},
			15 * 60000
		);

		void load();
	});

	onDestroy(() => {
		destroyed = true;
		generation++;
		request?.abort();
		clearInterval(timer);
		clearInterval(refreshTimer);
		singleclick.off(config.name, selectPoint);
		release(config.name, 'high');
		if (timestampListener != null) store.off(timestampListener);
		clearOverlay();
		if (pointer) map.removeLayer(pointer);
	});

	const func = p => p.name === selected.name;
	const click_handler = () => $$invalidate(6, hidden = false);
	const click_handler_1 = () => $$invalidate(6, hidden = true);

	function input0_change_handler() {
		enabled = this.checked;
		$$invalidate(1, enabled);
	}

	function input1_change_handler() {
		showDust = this.checked;
		$$invalidate(2, showDust);
	}

	const change_handler = event => {
		const place = places.find(p => p.name === event.currentTarget.value);

		if (place) {
			selectPoint(place);
			map.panTo([place.lat, place.lon]);
		}
	};

	const click_handler_2 = item => store.set('timestamp', Date.parse(item.validTime));

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*forecast, now*/ 262145) {
			$$invalidate(4, stale = !!forecast && (now - Date.parse(forecast.runTime) > MAX_RUN_AGE_MS || Date.parse(forecast.frames.at(-1).end) <= now));
		}

		if ($$self.$$.dirty[0] & /*enabled, stale, forecast, timestamp*/ 131091) {
			$$invalidate(5, frame = enabled && !stale ? frameAt(forecast, timestamp) : null);
		}

		if ($$self.$$.dirty[0] & /*forecast, frame, selected*/ 41) {
			$$invalidate(9, sample = forecast && frame
			? samplePoint(forecast, frame, selected.lat, selected.lon)
			: null);
		}

		if ($$self.$$.dirty[0] & /*forecast, enabled, frame, showDust, stale*/ 55) {
			if (forecast || !enabled) renderDust(frame, enabled && showDust && !stale);
		}
	};

	return [
		forecast,
		enabled,
		showDust,
		selected,
		stale,
		frame,
		hidden,
		loading,
		error,
		sample,
		places,
		displayTime,
		format,
		selectPoint,
		toggleEnabled,
		load,
		onopen,
		timestamp,
		now,
		func,
		click_handler,
		click_handler_1,
		input0_change_handler,
		input1_change_handler,
		change_handler,
		click_handler_2
	];
}

class PluginEntry extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 16 }, add_css, [-1, -1]);
	}

	get onopen() {
		return this.$$.ctx[16];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, PluginEntry as default };
//# sourceMappingURL=plugin.js.map
