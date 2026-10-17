const __pluginConfig =  {
  "name": "windy-plugin-jordan-dust-fog",
  "version": "0.2.0",
  "icon": "🌫️",
  "title": "Global Dust & Fog",
  "description": "Experimental global GEOS-FP dust overview. Fog and satellite integration pending.",
  "author": "Ramzi Kandah",
  "repository": "https://github.com/ramzik99/jordan-dust-fog",
  "desktopUI": "embedded",
  "mobileUI": "small",
  "addToContextmenu": true,
  "listenToSingleclick": true,
  "built": 1792271698909,
  "builtReadable": "2026-10-17T21:14:58.909Z"
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

/** @returns {number} */
function to_number(value) {
	return value === '' ? null : +value;
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
function validateForecast(data, now = Date.now(), checkExpiry = true) {
  if (!data || data.schemaVersion !== 1 || data.source !== 'NASA GEOS-FP') throw Error('Unsupported forecast format');
  if (!validDate(data.runTime) || !validDate(data.retrievedAt)) throw Error('Invalid source timestamps');
  const run = Date.parse(data.runTime);
  if (run > now + 3600000 || now - run > MAX_RUN_AGE_MS) throw Error('GEOS forecast run is stale or invalid');
  if (Date.parse(data.retrievedAt) > now + 3600000 || Date.parse(data.retrievedAt) < run) throw Error('Invalid retrieval time');
  if (!increasing(data.latitudes) || !increasing(data.longitudes) || data.latitudes.length < 2 || data.longitudes.length < 2) throw Error('Invalid spatial grid');
  if (data.latitudes[0] < -90 || data.latitudes.at(-1) > 90 || data.longitudes[0] < -180 || data.longitudes.at(-1) > 180) throw Error('Invalid coordinates');
  if (data.units?.dustSurface !== 'ug m-3' || data.units?.dustFine !== 'ug m-3' || data.units?.dustAod !== '1') throw Error('Unexpected units');
  if (!Array.isArray(data.frames) || !data.frames.length || data.frames.length > 100) throw Error('Invalid forecast frames');
  if (data.latitudes.length * data.longitudes.length > 50000) throw Error('Forecast grid exceeds size limit');
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
  if (checkExpiry && lastEnd <= now) throw Error('Forecast has expired');
  return data;
}
function frameAt(data, timestamp) {
  if (!Number.isFinite(timestamp)) return null;
  return data?.frames.find(f => timestamp >= Date.parse(f.start) && timestamp < Date.parse(f.end)) ?? null;
}
function samplePoint(data, frame, lat, lon) {
  if (!frame || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const ys = data.latitudes, xs = data.longitudes;
  const global = data.coverage === 'global';
  if (global) lon = wrapLongitude(lon);
  if (lat < ys[0] || lat > ys.at(-1) || (!global && (lon < xs[0] || lon > xs.at(-1)))) return null;
  const nearest = (a, value) => a.reduce((best, v, i) => Math.abs(v - value) < Math.abs(a[best] - value) ? i : best, 0);
  const y = nearest(ys, lat);
  const x = global ? xs.reduce((best, v, i) => Math.abs(wrapLongitude(v - lon)) < Math.abs(wrapLongitude(xs[best] - lon)) ? i : best, 0) : nearest(xs, lon);
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

function wrapLongitude(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function validateManifest(data, now = Date.now()) {
  if (data?.schemaVersion !== 2 || data.coverage !== 'global' || data.source !== 'NASA GEOS-FP') throw Error('Unsupported global manifest');
  if (!validDate(data.runTime) || !validDate(data.retrievedAt)) throw Error('Invalid source timestamps');
  const run = Date.parse(data.runTime);
  if (run > now + 3600000 || now - run > MAX_RUN_AGE_MS) throw Error('GEOS forecast run is stale or invalid');
  if (Date.parse(data.retrievedAt) < run || Date.parse(data.retrievedAt) > now + 3600000) throw Error('Invalid retrieval time');
  if (data.units?.dustSurface !== 'ug m-3' || data.units?.dustFine !== 'ug m-3' || data.units?.dustAod !== '1') throw Error('Unexpected units');
  const ys = data.latitudes, xs = data.longitudes;
  if (!increasing(ys) || !increasing(xs) || ys.length !== 145 || xs.length !== 288 || ys[0] !== -90 || ys.at(-1) !== 90 || xs[0] !== -180 || xs.at(-1) !== 178.75 ||
      ys.some((v, i) => i > 0 && Math.abs(v - ys[i - 1] - 1.25) > 1e-6) || xs.some((v, i) => i > 0 && Math.abs(v - xs[i - 1] - 1.25) > 1e-6) ||
      data.sampling?.latitudeDegrees !== 1.25 || data.sampling?.longitudeDegrees !== 1.25) throw Error('Invalid global sampling grid');
  if (!Array.isArray(data.frames) || !data.frames.length || data.frames.length > 100) throw Error('Invalid forecast frames');
  let lastEnd = -Infinity;
  const paths = new Set();
  const token = data.runTime.slice(0, 10).replaceAll('-', '') + '_' + data.runTime.slice(11, 13);
  for (const f of data.frames) {
    if (![f.start, f.end, f.validTime].every(validDate)) throw Error('Invalid frame times');
    const start = Date.parse(f.start), end = Date.parse(f.end);
    if (start < run || start < lastEnd || end - start !== 10800000 || Date.parse(f.validTime) !== (start + end) / 2) throw Error('Invalid or overlapping averaging intervals');
    const stamp = f.validTime.replaceAll('-', '').replaceAll(':', '');
    if (f.path !== `runs/${token}/${stamp}.json.gz` || paths.has(f.path)) throw Error('Invalid forecast path');
    paths.add(f.path); lastEnd = end;
  }
  if (lastEnd <= now) throw Error('Forecast has expired');
  return data;
}

function validateFrame(frame, manifest, descriptor, now = Date.now()) {
  validateManifest(manifest, now);
  if (!manifest.frames.some(f => f.path === descriptor?.path && f.validTime === descriptor.validTime)) throw Error('Unrecognised forecast interval');
  if (frame?.schemaVersion !== 2 || frame.source !== manifest.source || frame.runTime !== manifest.runTime ||
      ['start', 'end', 'validTime'].some(k => frame[k] !== descriptor[k])) throw Error('Forecast frame does not match manifest');
  validateForecast({ ...manifest, schemaVersion: 1, frames: [frame] }, now, false);
  return frame;
}

async function decodeFrameResponse(response) {
  if (typeof DecompressionStream === 'undefined') throw Error('This browser does not support compressed forecast files');
  const compressed = new Uint8Array(await response.arrayBuffer());
  if (compressed.byteLength > 2 * 1024 * 1024) throw Error('Compressed forecast exceeds size limit');
  const reader = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const parts = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) throw Error('Decoded forecast exceeds size limit');
      parts.push(value);
    }
  } finally { await reader.cancel(); }
  const joined = new Uint8Array(size); let offset = 0;
  for (const part of parts) { joined.set(part, offset); offset += part.byteLength; }
  return JSON.parse(new TextDecoder().decode(joined));
}

const clampLat = lat => Math.max(-85.05112878, Math.min(85.05112878, lat));
function worldCopies(west, east) {
  if (![west, east].every(Number.isFinite) || east < west) return [];
  const middle = Math.floor(((west + east) / 2 + 180) / 360);
  const lo = Math.max(middle - 3, Math.floor((west + 180) / 360) - 1);
  const hi = Math.min(middle + 3, Math.floor((east + 180) / 360) + 1);
  return Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => (lo + i) * 360);
}
function drawGlobalGrid(ctx, map, manifest, frame, width, height) {
  ctx.clearRect(0, 0, width, height);
  if (!manifest || !frame) return;
  const ys = manifest.latitudes, xs = manifest.longitudes, half = 0.625;
  const b = map.getBounds();
  const rows = ys.map(lat => [map.latLngToContainerPoint([clampLat(lat + half), 0]).y,
    map.latLngToContainerPoint([clampLat(lat - half), 0]).y]);
  ctx.globalAlpha = 0.48;
  for (const offset of worldCopies(b.getWest(), b.getEast())) {
    const columns = xs.map(lon => [map.latLngToContainerPoint([0, lon + offset - half]).x,
      map.latLngToContainerPoint([0, lon + offset + half]).x]);
    for (let y = 0; y < ys.length; y++) {
      const [top, bottom] = rows[y];
      if (top > height || bottom < 0 || bottom <= top) continue;
      for (let x = 0; x < xs.length; x++) {
        const [left, right] = columns[x];
        if (left > width || right < 0 || right <= left) continue;
        const color = dustColor(frame.dustSurface[y][x]);
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(Math.max(0, left), Math.max(0, top), Math.min(width, right) - Math.max(0, left), Math.min(height, bottom) - Math.max(0, top));
      }
    }
  }
  ctx.globalAlpha = 1;
}

/* src/pluginEntry.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-1poqr3u", ".panel.svelte-1poqr3u.svelte-1poqr3u,.restore.svelte-1poqr3u.svelte-1poqr3u{position:fixed;left:12px;bottom:95px;z-index:1100;background:#142536;color:#f0f5f8;border:1px solid #42586b;border-radius:14px;box-shadow:0 8px 28px #0005;font:13px/1.5 system-ui,sans-serif}.panel.svelte-1poqr3u.svelte-1poqr3u{width:290px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 180px);overflow:auto;padding:16px;box-sizing:border-box}.restore.svelte-1poqr3u.svelte-1poqr3u{padding:12px}header.svelte-1poqr3u.svelte-1poqr3u{display:flex;justify-content:space-between;gap:10px}header.svelte-1poqr3u strong.svelte-1poqr3u{font-size:17px}small.svelte-1poqr3u.svelte-1poqr3u{display:block;font-size:11px;color:#bbcad6}button.svelte-1poqr3u.svelte-1poqr3u,select.svelte-1poqr3u.svelte-1poqr3u{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:7px;padding:5px 8px;cursor:pointer}button.svelte-1poqr3u.svelte-1poqr3u:disabled{opacity:.5;cursor:default}button.svelte-1poqr3u.svelte-1poqr3u:focus-visible,select.svelte-1poqr3u.svelte-1poqr3u:focus-visible{outline:2px solid #f9a825;outline-offset:2px}.controls.svelte-1poqr3u.svelte-1poqr3u{display:flex;align-items:center;justify-content:space-between;margin:14px 0;gap:5px}label.svelte-1poqr3u.svelte-1poqr3u{display:flex;align-items:center;gap:4px}.place.svelte-1poqr3u.svelte-1poqr3u{justify-content:space-between;margin-bottom:5px}.reading.svelte-1poqr3u.svelte-1poqr3u{background:#21384a;border-radius:10px;padding:12px;margin:12px 0}.reading.svelte-1poqr3u>strong.svelte-1poqr3u{display:block;font-size:28px}.reading.svelte-1poqr3u strong small.svelte-1poqr3u{display:inline;font-size:14px}.reading.svelte-1poqr3u span.svelte-1poqr3u{font-size:12px}dl.svelte-1poqr3u.svelte-1poqr3u{margin:10px 0}dl.svelte-1poqr3u>div.svelte-1poqr3u{display:flex;justify-content:space-between;gap:8px;margin:5px 0}dt.svelte-1poqr3u.svelte-1poqr3u{font-size:11px;color:#bbcad6}dd.svelte-1poqr3u.svelte-1poqr3u{margin:0;font-size:12px}.legend.svelte-1poqr3u.svelte-1poqr3u{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin:14px 0 3px}.legend.svelte-1poqr3u span.svelte-1poqr3u{border-top:7px solid var(--color);padding-top:3px;font-size:10px}.pending.svelte-1poqr3u.svelte-1poqr3u{display:grid;grid-template-columns:1fr auto;gap:6px;border-top:1px solid #42586b;margin-top:12px;padding-top:12px;font-size:12px}.pending.svelte-1poqr3u span.svelte-1poqr3u{color:#bbcad6}.error.svelte-1poqr3u.svelte-1poqr3u{background:#692f30;padding:9px;border-radius:7px;font-size:12px}details.svelte-1poqr3u.svelte-1poqr3u{margin-top:12px}summary.svelte-1poqr3u.svelte-1poqr3u{cursor:pointer;font-size:12px}details.svelte-1poqr3u p.svelte-1poqr3u{font-size:11px;color:#bbcad6}a.svelte-1poqr3u.svelte-1poqr3u{color:#ffd486}.timeline.svelte-1poqr3u.svelte-1poqr3u{display:flex;gap:5px;flex-wrap:wrap;max-height:180px;overflow:auto;margin-top:8px}.timeline.svelte-1poqr3u button.svelte-1poqr3u{font-size:10px}.timeline.svelte-1poqr3u .active.svelte-1poqr3u{border-color:#f9a825}footer.svelte-1poqr3u.svelte-1poqr3u{font-size:10px;color:#bbcad6;border-top:1px solid #42586b;margin-top:12px;padding-top:8px}.coordinates.svelte-1poqr3u.svelte-1poqr3u{display:flex;gap:5px;margin:8px 0}.coordinates.svelte-1poqr3u label.svelte-1poqr3u{font-size:11px;min-width:0}.coordinates.svelte-1poqr3u input.svelte-1poqr3u{width:68px;max-width:100%;box-sizing:border-box;color:inherit;background:#253d50;border:1px solid #526879;border-radius:6px;padding:5px}@media(max-width:600px){.panel.svelte-1poqr3u.svelte-1poqr3u{bottom:100px;width:270px;max-height:55dvh}.restore.svelte-1poqr3u.svelte-1poqr3u{bottom:100px}}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[53] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[56] = list[i];
	return child_ctx;
}

// (258:0) {:else}
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
	let t13;
	let t14;
	let label2;
	let t15;
	let select;
	let show_if = !/*places*/ ctx[15].some(/*func*/ ctx[27]);
	let if_block4_anchor;
	let select_value_value;
	let t16;
	let small1;
	let t18;
	let div2;
	let label3;
	let t19;
	let input2;
	let label4;
	let t20;
	let input3;
	let button2;
	let t21;
	let button2_disabled_value;
	let t22;
	let t23;
	let small2;
	let t24_value = /*selected*/ ctx[3].lat.toFixed(3) + "";
	let t24;
	let t25;
	let t26_value = /*selected*/ ctx[3].lon.toFixed(3) + "";
	let t26;
	let t27;
	let t28;
	let small3;
	let t30;
	let div3;
	let span0;
	let t32;
	let strong1;
	let t33_value = /*format*/ ctx[17](/*sample*/ ctx[14]?.dustSurface) + "";
	let t33;
	let t34;
	let t35;
	let dl;
	let div4;
	let dt0;
	let dd0;
	let t37_value = /*format*/ ctx[17](/*sample*/ ctx[14]?.dustFine) + "";
	let t37;
	let t38_value = (/*sample*/ ctx[14]?.dustFine != null ? ' µg/m³' : '') + "";
	let t38;
	let div5;
	let dt1;
	let dd1;
	let t40_value = /*format*/ ctx[17](/*sample*/ ctx[14]?.dustAod, 2) + "";
	let t40;
	let t41;
	let t42;
	let t43;
	let details0;
	let summary0;
	let t45;
	let t46;
	let div6;
	let t51;
	let details1;
	let t62;
	let mounted;
	let dispose;
	let if_block0 = /*error*/ ctx[9] && create_if_block_12(ctx);
	let if_block1 = /*frameError*/ ctx[10] && create_if_block_11(ctx);
	let if_block2 = /*frameLoading*/ ctx[8] && create_if_block_10();
	let if_block3 = /*stale*/ ctx[5] && create_if_block_9();
	let if_block4 = show_if && create_if_block_8(ctx);
	let each_value_1 = ensure_array_like(/*places*/ ctx[15]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	let if_block5 = /*locationError*/ ctx[11] && create_if_block_7(ctx);
	let if_block6 = /*sample*/ ctx[14]?.dustSurface != null && create_if_block_6();

	function select_block_type_1(ctx, dirty) {
		if (/*desired*/ ctx[4]) return create_if_block_5;
		return create_else_block_2;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block7 = current_block_type(ctx);
	let if_block8 = /*sample*/ ctx[14] && create_if_block_4(ctx);
	let if_block9 = /*showDust*/ ctx[2] && create_if_block_3();

	function select_block_type_2(ctx, dirty) {
		if (/*forecast*/ ctx[0] && !/*stale*/ ctx[5]) return create_if_block_2;
		return create_else_block_1;
	}

	let current_block_type_1 = select_block_type_2(ctx);
	let if_block10 = current_block_type_1(ctx);
	let if_block11 = /*forecast*/ ctx[0] && create_if_block_1(ctx);

	return {
		c() {
			section = element("section");
			header = element("header");
			div0 = element("div");
			div0.innerHTML = `<strong class="svelte-1poqr3u">Global Dust &amp; Fog</strong><small class="svelte-1poqr3u">Experimental · v0.2.0</small>`;
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
			if (if_block2) if_block2.c();
			t13 = space();
			if (if_block3) if_block3.c();
			t14 = space();
			label2 = element("label");
			t15 = text("Location\n      ");
			select = element("select");
			if (if_block4) if_block4.c();
			if_block4_anchor = empty();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t16 = space();
			small1 = element("small");
			small1.textContent = "Click anywhere on the globe or enter coordinates.";
			t18 = space();
			div2 = element("div");
			label3 = element("label");
			t19 = text("Lat ");
			input2 = element("input");
			label4 = element("label");
			t20 = text("Lon ");
			input3 = element("input");
			button2 = element("button");
			t21 = text("Go");
			t22 = space();
			if (if_block5) if_block5.c();
			t23 = space();
			small2 = element("small");
			t24 = text(t24_value);
			t25 = text("°, ");
			t26 = text(t26_value);
			t27 = text("° · signed latitude / longitude");
			t28 = space();
			small3 = element("small");
			small3.textContent = "1.25° sampled overview · periods load on demand";
			t30 = space();
			div3 = element("div");
			span0 = element("span");
			span0.textContent = "Forecast surface dust · global overview";
			t32 = space();
			strong1 = element("strong");
			t33 = text(t33_value);
			if (if_block6) if_block6.c();
			t34 = space();
			if_block7.c();
			t35 = space();
			dl = element("dl");
			div4 = element("div");
			dt0 = element("dt");
			dt0.textContent = "Fine dust (PM₂.₅ component)";
			dd0 = element("dd");
			t37 = text(t37_value);
			t38 = text(t38_value);
			div5 = element("div");
			dt1 = element("dt");
			dt1.textContent = "Dust optical depth";
			dd1 = element("dd");
			t40 = text(t40_value);
			t41 = space();
			if (if_block8) if_block8.c();
			t42 = space();
			if (if_block9) if_block9.c();
			t43 = space();
			details0 = element("details");
			summary0 = element("summary");
			summary0.textContent = "Available forecast intervals";
			t45 = space();
			if_block10.c();
			t46 = space();
			div6 = element("div");
			div6.innerHTML = `<strong>Fog forecast</strong><span class="svelte-1poqr3u">Not connected</span><strong>Satellite observations</strong><span class="svelte-1poqr3u">Not connected</span>`;
			t51 = space();
			details1 = element("details");
			details1.innerHTML = `<summary class="svelte-1poqr3u">Sources and interpretation</summary> <p class="svelte-1poqr3u">Global NASA GEOS-FP · preview samples a 1.25° × 1.25° grid from the native 0.25° × 0.3125° model. Values are sampled nodes, not cell averages or street-level detail. Map cells represent the overview grid; polar values are available by coordinates, while the Mercator map stops near 85°.</p> <p class="svelte-1poqr3u">Surface dust is modelled dust mass, not total PM₁₀. Optical depth represents the whole atmospheric column; it is not surface visibility.</p> <p class="svelte-1poqr3u">No ground confirmation, calibrated alert thresholds or notifications are implemented in this first version. Satellite low cloud will require ground evidence to confirm fog.</p> <p class="svelte-1poqr3u"><a href="https://view.eumetsat.int/" target="_blank" rel="noopener noreferrer" class="svelte-1poqr3u">Open EUMETSAT imagery viewer ↗</a> (external viewer; imagery is not analysed by this plugin).</p>`;
			t62 = space();
			if (if_block11) if_block11.c();
			attr(button0, "title", "Minimize panel");
			attr(button0, "aria-label", "Minimize panel");
			attr(button0, "class", "svelte-1poqr3u");
			attr(header, "class", "svelte-1poqr3u");
			attr(input0, "type", "checkbox");
			attr(label0, "class", "svelte-1poqr3u");
			attr(input1, "type", "checkbox");
			attr(label1, "class", "svelte-1poqr3u");
			button1.disabled = button1_disabled_value = !/*enabled*/ ctx[1] || /*loading*/ ctx[7];
			attr(button1, "class", "svelte-1poqr3u");
			attr(div1, "class", "controls svelte-1poqr3u");
			attr(select, "class", "svelte-1poqr3u");
			attr(label2, "class", "place svelte-1poqr3u");
			attr(small1, "class", "svelte-1poqr3u");
			attr(input2, "aria-label", "Latitude");
			attr(input2, "type", "number");
			attr(input2, "min", "-90");
			attr(input2, "max", "90");
			attr(input2, "step", "any");
			attr(input2, "class", "svelte-1poqr3u");
			attr(label3, "class", "svelte-1poqr3u");
			attr(input3, "aria-label", "Longitude");
			attr(input3, "type", "number");
			attr(input3, "step", "any");
			attr(input3, "class", "svelte-1poqr3u");
			attr(label4, "class", "svelte-1poqr3u");
			button2.disabled = button2_disabled_value = !/*enabled*/ ctx[1];
			attr(button2, "class", "svelte-1poqr3u");
			attr(div2, "class", "coordinates svelte-1poqr3u");
			attr(small2, "class", "svelte-1poqr3u");
			attr(small3, "class", "svelte-1poqr3u");
			attr(span0, "class", "svelte-1poqr3u");
			attr(strong1, "class", "svelte-1poqr3u");
			attr(div3, "class", "reading svelte-1poqr3u");
			attr(dt0, "class", "svelte-1poqr3u");
			attr(dd0, "class", "svelte-1poqr3u");
			attr(div4, "class", "svelte-1poqr3u");
			attr(dt1, "class", "svelte-1poqr3u");
			attr(dd1, "class", "svelte-1poqr3u");
			attr(div5, "class", "svelte-1poqr3u");
			attr(dl, "class", "svelte-1poqr3u");
			attr(summary0, "class", "svelte-1poqr3u");
			attr(details0, "class", "svelte-1poqr3u");
			attr(div6, "class", "pending svelte-1poqr3u");
			attr(details1, "class", "svelte-1poqr3u");
			attr(section, "class", "panel svelte-1poqr3u");
			attr(section, "aria-label", "Global Dust and Fog");
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
			if (if_block2) if_block2.m(section, null);
			append(section, t13);
			if (if_block3) if_block3.m(section, null);
			append(section, t14);
			append(section, label2);
			append(label2, t15);
			append(label2, select);
			if (if_block4) if_block4.m(select, null);
			append(select, if_block4_anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*selected*/ ctx[3].name);
			append(section, t16);
			append(section, small1);
			append(section, t18);
			append(section, div2);
			append(div2, label3);
			append(label3, t19);
			append(label3, input2);
			set_input_value(input2, /*inputLat*/ ctx[12]);
			append(div2, label4);
			append(label4, t20);
			append(label4, input3);
			set_input_value(input3, /*inputLon*/ ctx[13]);
			append(div2, button2);
			append(button2, t21);
			append(section, t22);
			if (if_block5) if_block5.m(section, null);
			append(section, t23);
			append(section, small2);
			append(small2, t24);
			append(small2, t25);
			append(small2, t26);
			append(small2, t27);
			append(section, t28);
			append(section, small3);
			append(section, t30);
			append(section, div3);
			append(div3, span0);
			append(div3, t32);
			append(div3, strong1);
			append(strong1, t33);
			if (if_block6) if_block6.m(strong1, null);
			append(div3, t34);
			if_block7.m(div3, null);
			append(section, t35);
			append(section, dl);
			append(dl, div4);
			append(div4, dt0);
			append(div4, dd0);
			append(dd0, t37);
			append(dd0, t38);
			append(dl, div5);
			append(div5, dt1);
			append(div5, dd1);
			append(dd1, t40);
			append(section, t41);
			if (if_block8) if_block8.m(section, null);
			append(section, t42);
			if (if_block9) if_block9.m(section, null);
			append(section, t43);
			append(section, details0);
			append(details0, summary0);
			append(details0, t45);
			if_block10.m(details0, null);
			append(section, t46);
			append(section, div6);
			append(section, t51);
			append(section, details1);
			append(section, t62);
			if (if_block11) if_block11.m(section, null);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler_1*/ ctx[29]),
					listen(input0, "change", /*input0_change_handler*/ ctx[30]),
					listen(input0, "change", /*toggleEnabled*/ ctx[20]),
					listen(input1, "change", /*input1_change_handler*/ ctx[31]),
					listen(button1, "click", /*load*/ ctx[21]),
					listen(select, "change", /*change_handler*/ ctx[32]),
					listen(input2, "input", /*input2_input_handler*/ ctx[33]),
					listen(input3, "input", /*input3_input_handler*/ ctx[34]),
					listen(button2, "click", /*goToCoordinates*/ ctx[19])
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

			if (/*error*/ ctx[9]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_12(ctx);
					if_block0.c();
					if_block0.m(section, t11);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*frameError*/ ctx[10]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_11(ctx);
					if_block1.c();
					if_block1.m(section, t12);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*frameLoading*/ ctx[8]) {
				if (if_block2) ; else {
					if_block2 = create_if_block_10();
					if_block2.c();
					if_block2.m(section, t13);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*stale*/ ctx[5]) {
				if (if_block3) ; else {
					if_block3 = create_if_block_9();
					if_block3.c();
					if_block3.m(section, t14);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (dirty[0] & /*selected*/ 8) show_if = !/*places*/ ctx[15].some(/*func*/ ctx[27]);

			if (show_if) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block_8(ctx);
					if_block4.c();
					if_block4.m(select, if_block4_anchor);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}

			if (dirty[0] & /*places*/ 32768) {
				each_value_1 = ensure_array_like(/*places*/ ctx[15]);
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

			if (dirty[0] & /*selected, places*/ 32776 && select_value_value !== (select_value_value = /*selected*/ ctx[3].name)) {
				select_option(select, /*selected*/ ctx[3].name);
			}

			if (dirty[0] & /*inputLat*/ 4096 && to_number(input2.value) !== /*inputLat*/ ctx[12]) {
				set_input_value(input2, /*inputLat*/ ctx[12]);
			}

			if (dirty[0] & /*inputLon*/ 8192 && to_number(input3.value) !== /*inputLon*/ ctx[13]) {
				set_input_value(input3, /*inputLon*/ ctx[13]);
			}

			if (dirty[0] & /*enabled*/ 2 && button2_disabled_value !== (button2_disabled_value = !/*enabled*/ ctx[1])) {
				button2.disabled = button2_disabled_value;
			}

			if (/*locationError*/ ctx[11]) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block_7(ctx);
					if_block5.c();
					if_block5.m(section, t23);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}

			if (dirty[0] & /*selected*/ 8 && t24_value !== (t24_value = /*selected*/ ctx[3].lat.toFixed(3) + "")) set_data(t24, t24_value);
			if (dirty[0] & /*selected*/ 8 && t26_value !== (t26_value = /*selected*/ ctx[3].lon.toFixed(3) + "")) set_data(t26, t26_value);
			if (dirty[0] & /*sample*/ 16384 && t33_value !== (t33_value = /*format*/ ctx[17](/*sample*/ ctx[14]?.dustSurface) + "")) set_data(t33, t33_value);

			if (/*sample*/ ctx[14]?.dustSurface != null) {
				if (if_block6) ; else {
					if_block6 = create_if_block_6();
					if_block6.c();
					if_block6.m(strong1, null);
				}
			} else if (if_block6) {
				if_block6.d(1);
				if_block6 = null;
			}

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block7) {
				if_block7.p(ctx, dirty);
			} else {
				if_block7.d(1);
				if_block7 = current_block_type(ctx);

				if (if_block7) {
					if_block7.c();
					if_block7.m(div3, null);
				}
			}

			if (dirty[0] & /*sample*/ 16384 && t37_value !== (t37_value = /*format*/ ctx[17](/*sample*/ ctx[14]?.dustFine) + "")) set_data(t37, t37_value);
			if (dirty[0] & /*sample*/ 16384 && t38_value !== (t38_value = (/*sample*/ ctx[14]?.dustFine != null ? ' µg/m³' : '') + "")) set_data(t38, t38_value);
			if (dirty[0] & /*sample*/ 16384 && t40_value !== (t40_value = /*format*/ ctx[17](/*sample*/ ctx[14]?.dustAod, 2) + "")) set_data(t40, t40_value);

			if (/*sample*/ ctx[14]) {
				if (if_block8) {
					if_block8.p(ctx, dirty);
				} else {
					if_block8 = create_if_block_4(ctx);
					if_block8.c();
					if_block8.m(section, t42);
				}
			} else if (if_block8) {
				if_block8.d(1);
				if_block8 = null;
			}

			if (/*showDust*/ ctx[2]) {
				if (if_block9) ; else {
					if_block9 = create_if_block_3();
					if_block9.c();
					if_block9.m(section, t43);
				}
			} else if (if_block9) {
				if_block9.d(1);
				if_block9 = null;
			}

			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx)) && if_block10) {
				if_block10.p(ctx, dirty);
			} else {
				if_block10.d(1);
				if_block10 = current_block_type_1(ctx);

				if (if_block10) {
					if_block10.c();
					if_block10.m(details0, null);
				}
			}

			if (/*forecast*/ ctx[0]) {
				if (if_block11) {
					if_block11.p(ctx, dirty);
				} else {
					if_block11 = create_if_block_1(ctx);
					if_block11.c();
					if_block11.m(section, null);
				}
			} else if (if_block11) {
				if_block11.d(1);
				if_block11 = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(section);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			destroy_each(each_blocks, detaching);
			if (if_block5) if_block5.d();
			if (if_block6) if_block6.d();
			if_block7.d();
			if (if_block8) if_block8.d();
			if (if_block9) if_block9.d();
			if_block10.d();
			if (if_block11) if_block11.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (256:0) {#if hidden}
function create_if_block(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "🌫 Global Dust & Fog";
			attr(button, "class", "restore svelte-1poqr3u");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[28]);
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

// (267:4) {#if error}
function create_if_block_12(ctx) {
	let p;
	let t;

	return {
		c() {
			p = element("p");
			t = text(/*error*/ ctx[9]);
			attr(p, "class", "error svelte-1poqr3u");
			attr(p, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*error*/ 512) set_data(t, /*error*/ ctx[9]);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (268:4) {#if frameError}
function create_if_block_11(ctx) {
	let p;
	let t;

	return {
		c() {
			p = element("p");
			t = text(/*frameError*/ ctx[10]);
			attr(p, "class", "error svelte-1poqr3u");
			attr(p, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*frameError*/ 1024) set_data(t, /*frameError*/ ctx[10]);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (269:4) {#if frameLoading}
function create_if_block_10(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Loading selected global forecast period…";
			attr(p, "role", "status");
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

// (270:4) {#if stale}
function create_if_block_9(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Forecast expired or model run older than 36 hours. Layer hidden.";
			attr(p, "class", "error svelte-1poqr3u");
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

// (273:8) {#if !places.some(p => p.name === selected.name)}
function create_if_block_8(ctx) {
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

			if (dirty[0] & /*selected, places*/ 32776 && option_value_value !== (option_value_value = /*selected*/ ctx[3].name)) {
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

// (274:8) {#each places as place}
function create_each_block_1(ctx) {
	let option;
	let t_value = /*place*/ ctx[56].name + "";
	let t;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = /*place*/ ctx[56].name;
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

// (279:4) {#if locationError}
function create_if_block_7(ctx) {
	let p;
	let t;

	return {
		c() {
			p = element("p");
			t = text(/*locationError*/ ctx[11]);
			attr(p, "class", "error svelte-1poqr3u");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*locationError*/ 2048) set_data(t, /*locationError*/ ctx[11]);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (284:43) {#if sample?.dustSurface != null}
function create_if_block_6(ctx) {
	let small;

	return {
		c() {
			small = element("small");
			small.textContent = "µg/m³";
			attr(small, "class", "svelte-1poqr3u");
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

// (286:6) {:else}
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
			attr(small, "class", "svelte-1poqr3u");
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

// (285:6) {#if desired}
function create_if_block_5(ctx) {
	let small;
	let t0_value = /*displayTime*/ ctx[16](/*desired*/ ctx[4].start) + "";
	let t0;
	let t1;
	let t2_value = /*displayTime*/ ctx[16](/*desired*/ ctx[4].end) + "";
	let t2;
	let t3;

	return {
		c() {
			small = element("small");
			t0 = text(t0_value);
			t1 = text(" – ");
			t2 = text(t2_value);
			t3 = text(" · 3-hour mean");
			attr(small, "class", "svelte-1poqr3u");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t0);
			append(small, t1);
			append(small, t2);
			append(small, t3);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*desired*/ 16 && t0_value !== (t0_value = /*displayTime*/ ctx[16](/*desired*/ ctx[4].start) + "")) set_data(t0, t0_value);
			if (dirty[0] & /*desired*/ 16 && t2_value !== (t2_value = /*displayTime*/ ctx[16](/*desired*/ ctx[4].end) + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (290:4) {#if sample}
function create_if_block_4(ctx) {
	let small;
	let t0;
	let t1_value = /*sample*/ ctx[14].lat.toFixed(3) + "";
	let t1;
	let t2;
	let t3_value = /*sample*/ ctx[14].lon.toFixed(3) + "";
	let t3;
	let t4;

	return {
		c() {
			small = element("small");
			t0 = text("Nearest sampled GEOS node: ");
			t1 = text(t1_value);
			t2 = text("°, ");
			t3 = text(t3_value);
			t4 = text("°");
			attr(small, "class", "svelte-1poqr3u");
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
			if (dirty[0] & /*sample*/ 16384 && t1_value !== (t1_value = /*sample*/ ctx[14].lat.toFixed(3) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*sample*/ 16384 && t3_value !== (t3_value = /*sample*/ ctx[14].lon.toFixed(3) + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (291:4) {#if showDust}
function create_if_block_3(ctx) {
	let div;
	let small;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<span style="--color:#fde0a3" class="svelte-1poqr3u">0–100</span><span style="--color:#f9a825" class="svelte-1poqr3u">100–300</span> <span style="--color:#e36c23" class="svelte-1poqr3u">300–1,000</span><span style="--color:#b64231" class="svelte-1poqr3u">≥1,000</span> `;
			small = element("small");
			small.textContent = "µg/m³ · display bins, not warning levels · blank cells may be unknown";
			attr(div, "class", "legend svelte-1poqr3u");
			attr(div, "aria-label", "Surface dust concentration scale");
			attr(small, "class", "svelte-1poqr3u");
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

// (298:19) {:else}
function create_else_block_1(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Forecast unavailable.";
			attr(p, "class", "svelte-1poqr3u");
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

// (296:6) {#if forecast && !stale}
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

			attr(div, "class", "timeline svelte-1poqr3u");
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
			if (dirty[0] & /*desired, forecast, displayTime*/ 65553) {
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

// (296:52) {#each forecast.frames as item}
function create_each_block(ctx) {
	let button;
	let t0_value = /*displayTime*/ ctx[16](/*item*/ ctx[53].validTime) + "";
	let t0;
	let t1;
	let mounted;
	let dispose;

	function click_handler_2() {
		return /*click_handler_2*/ ctx[35](/*item*/ ctx[53]);
	}

	return {
		c() {
			button = element("button");
			t0 = text(t0_value);
			t1 = space();
			attr(button, "class", "svelte-1poqr3u");
			toggle_class(button, "active", /*desired*/ ctx[4] === /*item*/ ctx[53]);
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
			if (dirty[0] & /*forecast*/ 1 && t0_value !== (t0_value = /*displayTime*/ ctx[16](/*item*/ ctx[53].validTime) + "")) set_data(t0, t0_value);

			if (dirty[0] & /*desired, forecast*/ 17) {
				toggle_class(button, "active", /*desired*/ ctx[4] === /*item*/ ctx[53]);
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

// (307:4) {#if forecast}
function create_if_block_1(ctx) {
	let footer;
	let t0;
	let t1_value = /*displayTime*/ ctx[16](/*forecast*/ ctx[0].runTime) + "";
	let t1;
	let br0;
	let t2;
	let t3_value = /*displayTime*/ ctx[16](/*forecast*/ ctx[0].retrievedAt) + "";
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
			attr(footer, "class", "svelte-1poqr3u");
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
			if (dirty[0] & /*forecast*/ 1 && t1_value !== (t1_value = /*displayTime*/ ctx[16](/*forecast*/ ctx[0].runTime) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*forecast*/ 1 && t3_value !== (t3_value = /*displayTime*/ ctx[16](/*forecast*/ ctx[0].retrievedAt) + "")) set_data(t3, t3_value);
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

const BASE = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/main/data/global/';

function instance($$self, $$props, $$invalidate) {
	let stale;
	let desired;
	let sample;

	const places = [
		{ name: 'Amman', lat: 31.95, lon: 35.93 },
		{ name: 'Fuheis', lat: 32.01, lon: 35.77 },
		{ name: 'London', lat: 51.51, lon: -0.13 },
		{
			name: 'New York',
			lat: 40.71,
			lon: -74.01
		},
		{ name: 'Delhi', lat: 28.61, lon: 77.21 },
		{ name: 'Sydney', lat: -33.87, lon: 151.21 },
		{
			name: 'Cape Town',
			lat: -33.92,
			lon: 18.42
		},
		{
			name: 'São Paulo',
			lat: -23.55,
			lon: -46.63
		}
	];

	let forecast = null, activeFrame = null;

	let enabled = true,
		showDust = true,
		hidden = false,
		loading = false,
		frameLoading = false,
		destroyed = false;

	let error = '',
		frameError = '',
		locationError = '',
		timestamp = Date.now(),
		now = Date.now();

	let selected = places[0], inputLat = selected.lat, inputLon = selected.lon;
	let canvas = null, pointer = null, drawRequest = 0;
	let manifestAbort = null, frameAbort = null;
	let timer, refreshTimer, timestampListener, resizeObserver = null;
	let manifestEpoch = 0, frameEpoch = 0, frameKey = '';
	const frames = new Map();

	const displayTime = value => new Date(value).toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	const format = (value, digits = 0) => value === null || value === undefined
	? 'Unavailable'
	: value.toFixed(digits);

	function scheduleRender(..._args) {
		if (destroyed || !canvas || drawRequest) return;
		drawRequest = requestAnimationFrame(paint);
	}

	function paint() {
		drawRequest = 0;
		if (!canvas || destroyed) return;
		const size = map.getSize(), ratio = Math.min(window.devicePixelRatio || 1, 2);
		const width = Math.max(1, size.x), height = Math.max(1, size.y);

		if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
			$$invalidate(26, canvas.width = Math.round(width * ratio), canvas);
			$$invalidate(26, canvas.height = Math.round(height * ratio), canvas);
		}

		$$invalidate(26, canvas.style.width = width + 'px', canvas);
		$$invalidate(26, canvas.style.height = height + 'px', canvas);
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		const visible = enabled && showDust && !stale && desired && activeFrame?.validTime === desired.validTime;
		drawGlobalGrid(ctx, map, visible ? forecast : null, visible ? activeFrame : null, width, height);
	}

	function selectPoint(value) {
		if (!enabled) return;
		const lat = value?.lat ?? value?.latitude ?? value?.latlng?.lat;
		const rawLon = value?.lon ?? value?.lng ?? value?.longitude ?? value?.latlng?.lng;

		if (typeof lat !== 'number' || typeof rawLon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(rawLon) || lat < -90 || lat > 90) {
			$$invalidate(11, locationError = 'Enter a latitude from −90 to 90 and a finite longitude.');
			return;
		}

		const lon = wrapLongitude(rawLon);
		$$invalidate(11, locationError = '');

		$$invalidate(3, selected = {
			name: value.name || 'Selected location',
			lat,
			lon
		});

		$$invalidate(12, inputLat = lat);
		$$invalidate(13, inputLon = lon);
		if (pointer) map.removeLayer(pointer);

		if (typeof L !== 'undefined') pointer = L.circleMarker([Math.max(-85, Math.min(85, lat)), lon], {
			radius: 6,
			color: '#fff',
			fillColor: '#183047',
			fillOpacity: 1,
			weight: 2
		}).addTo(map);
	}

	function goToCoordinates() {
		selectPoint({ lat: inputLat, lon: inputLon });
		if (!locationError && enabled) map.panTo([Math.max(-85, Math.min(85, selected.lat)), selected.lon]);
	}

	function stopFrame() {
		frameEpoch++;
		frameAbort?.abort();
		frameAbort = null;
		frameKey = '';
		$$invalidate(8, frameLoading = false);
		$$invalidate(23, activeFrame = null);
	}

	function toggleEnabled() {
		if (enabled) {
			register(config.name, 'high');
			if (!forecast) void load();
		} else {
			release(config.name, 'high');
			manifestEpoch++;
			manifestAbort?.abort();
			$$invalidate(7, loading = false);
			stopFrame();

			if (pointer) {
				map.removeLayer(pointer);
				pointer = null;
			}
		}
	}

	async function syncFrame(data, descriptor, on, expired) {
		if (!on || expired || !data || !descriptor) {
			stopFrame();
			return;
		}

		const key = data.runTime + ':' + descriptor.validTime;
		if (frameKey === key && (activeFrame || frameLoading)) return;
		stopFrame();
		const epoch = ++frameEpoch;
		frameKey = key;
		$$invalidate(10, frameError = '');
		const cached = frames.get(key);

		if (cached) {
			try {
				$$invalidate(23, activeFrame = validateFrame(cached, data, descriptor));
				frames.delete(key);
				frames.set(key, cached);
				return;
			} catch {
				frames.delete(key);
			}
		}

		const abort = new AbortController();
		frameAbort = abort;
		$$invalidate(8, frameLoading = true);
		const timeout = setTimeout(() => abort.abort(), 30000);

		try {
			const response = await fetch(BASE + descriptor.path, { signal: abort.signal });
			if (!response.ok) throw Error('Forecast period unavailable (HTTP ' + response.status + ')');
			const decoded = await decodeFrameResponse(response);
			const frame = validateFrame(decoded, data, descriptor);
			if (destroyed || epoch !== frameEpoch || !enabled) return;
			frames.set(key, frame);
			while (frames.size > 4) frames.delete(frames.keys().next().value);
			$$invalidate(23, activeFrame = frame);
		} catch(err) {
			if (destroyed || epoch !== frameEpoch) return;

			$$invalidate(10, frameError = err?.name === 'AbortError'
			? 'Forecast period request timed out.'
			: String(err?.message || err));

			$$invalidate(23, activeFrame = null);
			frameKey = '';
		} finally {
			clearTimeout(timeout);
			if (epoch === frameEpoch) $$invalidate(8, frameLoading = false);
		}
	}

	async function load() {
		manifestAbort?.abort();
		const abort = new AbortController();
		manifestAbort = abort;
		const epoch = ++manifestEpoch;
		$$invalidate(7, loading = true);
		$$invalidate(9, error = '');
		$$invalidate(10, frameError = '');
		const timeout = setTimeout(() => abort.abort(), 20000);

		try {
			const response = await fetch(BASE + 'latest.json?t=' + Math.floor(Date.now() / 300000), { signal: abort.signal });

			if (!response.ok) throw Error(response.status === 404
			? 'Global forecast not yet available. Global ingestion must succeed first.'
			: 'Forecast server returned HTTP ' + response.status);

			const text = await response.text();
			if (text.length > 100000) throw Error('Forecast manifest exceeds size limit');
			const loaded = validateManifest(JSON.parse(text));
			if (forecast && Date.parse(loaded.runTime) < Date.parse(forecast.runTime)) throw Error('Server returned an older model run');
			if (destroyed || epoch !== manifestEpoch || !enabled) return;
			stopFrame();
			if (forecast?.runTime !== loaded.runTime) frames.clear();
			$$invalidate(0, forecast = loaded);
			$$invalidate(25, now = Date.now());
		} catch(err) {
			if (destroyed || epoch !== manifestEpoch) return;

			$$invalidate(9, error = err?.name === 'AbortError'
			? 'Forecast request timed out or was cancelled.'
			: String(err?.message || err));

			$$invalidate(0, forecast = null);
			stopFrame();
		} finally {
			clearTimeout(timeout);
			if (epoch === manifestEpoch) $$invalidate(7, loading = false);
		}
	}

	const onopen = params => {
		$$invalidate(6, hidden = false);
		if (enabled) register(config.name, 'high');
		if (params) selectPoint(params);
	};

	onMount(() => {
		$$invalidate(26, canvas = document.createElement('canvas'));

		Object.assign(canvas.style, {
			position: 'absolute',
			left: '0',
			top: '0',
			pointerEvents: 'none',
			zIndex: '390'
		});

		canvas.setAttribute('aria-hidden', 'true');
		map.getContainer().appendChild(canvas);
		singleclick.on(config.name, selectPoint);
		register(config.name, 'high');
		$$invalidate(24, timestamp = Number(store.get('timestamp')) || Date.now());

		timestampListener = store.on('timestamp', () => {
			$$invalidate(24, timestamp = Number(store.get('timestamp')));
		});

		map.on('move', scheduleRender);
		map.on('zoom', scheduleRender);
		map.on('resize', scheduleRender);

		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => scheduleRender());
			resizeObserver.observe(map.getContainer());
		}

		timer = setInterval(
			() => {
				$$invalidate(25, now = Date.now());
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
		manifestEpoch++;
		manifestAbort?.abort();
		stopFrame();
		frames.clear();
		clearInterval(timer);
		clearInterval(refreshTimer);
		if (drawRequest) cancelAnimationFrame(drawRequest);
		resizeObserver?.disconnect();
		canvas?.remove();
		$$invalidate(26, canvas = null);
		map.off('move', scheduleRender);
		map.off('zoom', scheduleRender);
		map.off('resize', scheduleRender);
		singleclick.off(config.name, selectPoint);
		release(config.name, 'high');
		if (timestampListener != null) store.off(timestampListener);
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

	function input2_input_handler() {
		inputLat = to_number(this.value);
		$$invalidate(12, inputLat);
	}

	function input3_input_handler() {
		inputLon = to_number(this.value);
		$$invalidate(13, inputLon);
	}

	const click_handler_2 = item => store.set('timestamp', Date.parse(item.validTime));

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*forecast, now*/ 33554433) {
			$$invalidate(5, stale = !!forecast && (now - Date.parse(forecast.runTime) > MAX_RUN_AGE_MS || Date.parse(forecast.frames.at(-1).end) <= now));
		}

		if ($$self.$$.dirty[0] & /*enabled, stale, forecast, timestamp*/ 16777251) {
			$$invalidate(4, desired = enabled && !stale ? frameAt(forecast, timestamp) : null);
		}

		if ($$self.$$.dirty[0] & /*forecast, desired, enabled, stale*/ 51) {
			void syncFrame(forecast, desired, enabled, stale);
		}

		if ($$self.$$.dirty[0] & /*forecast, desired, activeFrame, selected*/ 8388633) {
			$$invalidate(14, sample = forecast && desired && activeFrame && activeFrame.validTime === desired.validTime
			? samplePoint(forecast, activeFrame, selected.lat, selected.lon)
			: null);
		}

		if ($$self.$$.dirty[0] & /*canvas, forecast, activeFrame, enabled, showDust, stale, desired*/ 75497527) {
			if (canvas) scheduleRender(forecast, activeFrame, enabled, showDust, stale, desired);
		}
	};

	return [
		forecast,
		enabled,
		showDust,
		selected,
		desired,
		stale,
		hidden,
		loading,
		frameLoading,
		error,
		frameError,
		locationError,
		inputLat,
		inputLon,
		sample,
		places,
		displayTime,
		format,
		selectPoint,
		goToCoordinates,
		toggleEnabled,
		load,
		onopen,
		activeFrame,
		timestamp,
		now,
		canvas,
		func,
		click_handler,
		click_handler_1,
		input0_change_handler,
		input1_change_handler,
		change_handler,
		input2_input_handler,
		input3_input_handler,
		click_handler_2
	];
}

class PluginEntry extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 22 }, add_css, [-1, -1]);
	}

	get onopen() {
		return this.$$.ctx[22];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, PluginEntry as default };
//# sourceMappingURL=plugin.js.map
