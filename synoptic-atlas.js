const __pluginConfig =  {
  "name": "windy-plugin-synoptic-atlas",
  "version": "1.0.0",
  "icon": "🌐",
  "title": "Synoptic Atlas",
  "description": "Independent GEOS-FP geopotential height, temperature and MSLP isolines, with pressure levels and labels.",
  "author": "Ramzi Kandah",
  "repository": "https://github.com/ramzik99/jordan-dust-fog/tree/main/synoptic-atlas",
  "desktopUI": "embedded",
  "mobileUI": "small",
  "addToContextmenu": false,
  "listenToSingleclick": false,
  "built": 1792353241806,
  "builtReadable": "2026-10-18T19:54:01.806Z"
};

// transformCode: import { map } from '@windy/map';
const { map } = W.map;

// transformCode: import store from '@windy/store';
const store = W.store;


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
	if (!mounting || value !== undefined) {
		select.selectedIndex = -1; // no option should be selected
	}
}

function select_value(select) {
	const selected_option = select.querySelector(':checked');
	return selected_option && selected_option.__value;
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
    version: '1.0.0',
    title: 'Synoptic Atlas'};

const MAX_RUN_AGE_MS = 36 * 3600000;

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

function worldCopies(west, east) {
  if (![west, east].every(Number.isFinite) || east < west) return [];
  const middle = Math.floor(((west + east) / 2 + 180) / 360);
  const lo = Math.max(middle - 3, Math.floor((west + 180) / 360) - 1);
  const hi = Math.min(middle + 3, Math.floor((east + 180) / 360) + 1);
  return Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => (lo + i) * 360);
}

const CONTOUR_BASE = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/geos-synoptic-data/contours/';
const PRESSURE_LEVELS = [925, 850, 700, 500, 300];
const CONTOUR_FIELDS = {
  gh: { label: 'Geopotential height', units: 'dam', steps: [3, 6, 12], bounds: [-100, 6000] },
  temp: { label: 'Temperature', units: 'degC', steps: [2, 4, 8], bounds: [-173.2, 126.9] },
  mslp: { label: 'MSLP', units: 'hPa', steps: [2, 4, 8], bounds: [800, 1100] },
};
function defaultContours() {
  return { labels: true, gh: { on: false, level: 500, step: 6, color: '#ffd166' },
    temp: { on: false, level: 850, step: 4, color: '#66d9ff' }, mslp: { on: false, level: 0, step: 4, color: '#ffffff' } };
}
function safeContourOptions(raw) {
  const result = defaultContours(); if (!raw) return result;
  result.labels = raw.labels !== false;
  for (const key of Object.keys(CONTOUR_FIELDS)) {
    const p = raw[key]; if (!p) continue;
    result[key].on = p.on === true;
    if (key !== 'mslp' && PRESSURE_LEVELS.includes(p.level)) result[key].level = p.level;
    if (CONTOUR_FIELDS[key].steps.includes(p.step)) result[key].step = p.step;
    if (/^#[a-f0-9]{6}$/i.test(p.color || '')) result[key].color = p.color;
  }
  return result;
}
const validDate = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value) && Number.isFinite(Date.parse(value));
function validateContourManifest(m, now = Date.now()) {
  if (m?.schemaVersion !== 1 || m.source !== 'NASA GEOS-FP' || m.collection !== 'inst3_3d_asm_Np') throw Error('Unsupported contour data');
  if (!validDate(m.runTime) || !validDate(m.retrievedAt) || Date.parse(m.runTime) > now + 3600000 || now - Date.parse(m.runTime) > MAX_RUN_AGE_MS || Date.parse(m.retrievedAt) < Date.parse(m.runTime) || Date.parse(m.retrievedAt) > now + 3600000) throw Error('Contour run is stale or invalid');
  const g = m.grid;
  if (!g || g.width !== 288 || g.height !== 145 || g.longitudeStart !== -180 || g.latitudeStart !== -90 || g.step !== 1.25 || JSON.stringify(m.levels) !== JSON.stringify(PRESSURE_LEVELS)) throw Error('Unexpected contour grid or pressure levels');
  if (Object.keys(CONTOUR_FIELDS).some(k => m.units?.[k] !== CONTOUR_FIELDS[k].units)) throw Error('Unexpected contour units');
  if (!Array.isArray(m.frames) || m.frames.length < 2 || m.frames.length > 42) throw Error('Invalid contour snapshots');
  let previous = -Infinity;
  for (const f of m.frames) {
    const t = Date.parse(f.validTime);
    if (!validDate(f.validTime) || t < Date.parse(m.runTime) || t > Date.parse(m.runTime) + 120 * 3600000 || t <= previous || previous !== -Infinity && t - previous !== 10800000) throw Error('Invalid contour snapshot time');
    previous = t;
  }
  if (previous + 5400000 < now) throw Error('Contour forecast expired');
  return m;
}
function contourSnapshot(manifest, timestamp) {
  if (!manifest || !Number.isFinite(timestamp)) return null;
  const frame = manifest.frames.reduce((best, f) => Math.abs(Date.parse(f.validTime) - timestamp) < Math.abs(Date.parse(best.validTime) - timestamp) ? f : best);
  return Math.abs(Date.parse(frame.validTime) - timestamp) <= 5400000 ? frame : null;
}
function contourPath(manifest, frame, field, level) {
  if (!CONTOUR_FIELDS[field] || field === 'mslp' && level !== 0 || field !== 'mslp' && !PRESSURE_LEVELS.includes(level)) throw Error('Unknown contour field or level');
  if (!manifest.frames.includes(frame)) throw Error('Unknown contour snapshot');
  const token = manifest.runTime.slice(0, 10).replaceAll('-', '') + '_' + manifest.runTime.slice(11, 13);
  const stamp = frame.validTime.replaceAll('-', '').replaceAll(':', '');
  return `runs/${token}/${stamp}/${field}-${level}.json.gz`;
}
function validateContourField(data, manifest, frame, field, level) {
  if (data?.schemaVersion !== 1 || data.runTime !== manifest.runTime || data.validTime !== frame.validTime || data.field !== field || data.level !== level || data.units !== CONTOUR_FIELDS[field]?.units) throw Error('Contour field does not match its snapshot');
  const [lo, hi] = CONTOUR_FIELDS[field].bounds;
  if (!Array.isArray(data.values) || data.values.length !== manifest.grid.width * manifest.grid.height || data.values.some(v => v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi))) throw Error('Invalid contour values');
  return Float32Array.from(data.values, v => v === null ? NaN : v);
}
// Marching squares with a bilinear saddle decider. Missing corners leave gaps.
// A periodic final column closes the seam at +180 without long crossing lines.
function contourSegments(values, grid, step) {
  const { width: w, height: h, longitudeStart: x0, latitudeStart: y0, step: d } = grid;
  if (values.length !== w * h || !Number.isFinite(step) || step <= 0) throw Error('Invalid contour input');
  let min = Infinity, max = -Infinity;
  for (const v of values) if (Number.isFinite(v)) { min = Math.min(min, v); max = Math.max(max, v); }
  if (min === Infinity || min === max) return [];
  const first = Math.ceil(min / step) * step, count = Math.floor((max - first) / step) + 1;
  if (count > 200) throw Error('Contour interval is too small');
  const segments = [], table = { 1: [[3,0]], 2: [[0,1]], 3: [[3,1]], 4: [[1,2]], 6: [[0,2]], 7: [[3,2]],
    8: [[2,3]], 9: [[0,2]], 11: [[1,2]], 12: [[1,3]], 13: [[0,1]], 14: [[3,0]] };
  for (let n = 0; n < count; n++) {
    const level = first + n * step;
    for (let y = 0; y < h - 1; y++) for (let x = 0; x < w; x++) {
      const next = (x + 1) % w;
      const v = [values[y*w+x], values[y*w+next], values[(y+1)*w+next], values[(y+1)*w+x]];
      if (v.some(a => !Number.isFinite(a))) continue;
      const mask = v.reduce((m, a, i) => m | (a >= level ? 1 << i : 0), 0);
      if (!mask || mask === 15) continue;
      const pairs = mask === 5 || mask === 10 ? ((v[0]-level)*(v[2]-level)-(v[1]-level)*(v[3]-level) >= 0 ? [[0,1],[2,3]] : [[3,0],[1,2]]) : table[mask];
      const positions = [[x0+x*d,y0+y*d],[x0+(x+1)*d,y0+y*d],[x0+(x+1)*d,y0+(y+1)*d],[x0+x*d,y0+(y+1)*d]];
      const cross = edge => { const a = edge, b = (edge + 1) % 4, f = (level - v[a]) / (v[b] - v[a]); return [positions[a][0] + f * (positions[b][0]-positions[a][0]), positions[a][1] + f * (positions[b][1]-positions[a][1])]; };
      for (const [a,b] of pairs) { const p = cross(a), q = cross(b); if (p.every(Number.isFinite) && q.every(Number.isFinite) && Math.hypot(p[0]-q[0],p[1]-q[1]) > 1e-9) segments.push([p[0],p[1],q[0],q[1],level]); }
    }
  }
  return segments;
}
const clampLat = lat => Math.max(-85.05112878, Math.min(85.05112878, lat));
function drawContours(ctx, map, layers, options, width, height) {
  ctx.clearRect(0, 0, width, height); const bounds = map.getBounds(), occupied = new Set(), labelGroups = [], boxes = [];
  for (const layer of layers) {
    const config = options[layer.field], visible = [];
    if (!config?.on || config.level !== layer.level) continue;
    for (const offset of worldCopies(bounds.getWest(), bounds.getEast())) for (const s of layer.segments) {
      const a = map.latLngToContainerPoint([clampLat(s[1]), s[0]+offset]), b = map.latLngToContainerPoint([clampLat(s[3]), s[2]+offset]);
      if (Math.max(a.x,b.x)<0 || Math.min(a.x,b.x)>width || Math.max(a.y,b.y)<0 || Math.min(a.y,b.y)>height) continue;
      visible.push([a,b,s[4]]);
    }
    ctx.beginPath(); for (const [a,b] of visible) { ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
    ctx.lineJoin = 'round'; ctx.setLineDash(layer.field === 'temp' ? [5,3] : []);
    ctx.strokeStyle = '#102131'; ctx.lineWidth = 3.8; ctx.stroke();
    ctx.strokeStyle = config.color; ctx.lineWidth = layer.field === 'gh' ? 1.8 : 1.3; ctx.stroke(); ctx.setLineDash([]);
    labelGroups.push({ layer, config, visible });
  }
  if (options.labels) {
    for (const { layer, config, visible } of labelGroups) {
      ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const [a,b,level] of visible) {
        const x=(a.x+b.x)/2, y=(a.y+b.y)/2;
        if (x<45 || x>width-45 || y<18 || y>height-18) continue;
        const cell = layer.field+':'+Math.floor(x/135)+':'+Math.floor(y/65); if (occupied.has(cell)) continue;
        const label = layer.field === 'mslp' ? `${level} hPa` : `${layer.level}h ${level}${layer.field === 'gh' ? ' dam' : '\u00b0C'}`;
        const half=(ctx.measureText?.(label).width || label.length*6)/2;
        if(boxes.some(b=>Math.abs(b.x-x)<b.half+half+5 && Math.abs(b.y-y)<19)) continue;
        occupied.add(cell); boxes.push({x,y,half});
        ctx.strokeStyle = '#102131'; ctx.lineWidth = 3.5; ctx.strokeText(label,x,y); ctx.fillStyle=config.color; ctx.fillText(label,x,y);
      }
    }
  }
  ctx.setLineDash([]);
}
class ContourOverlay {
  constructor({ map, onChange = () => {}, onRender = () => {}, fetcher = (...args) => globalThis.fetch(...args), base = CONTOUR_BASE }) {
    this.map=map; this.onChange=onChange; this.onRender=onRender; this.fetcher=fetcher; this.base=base;
    this.manifest=null; this.manifestAt=0; this.cache=new Map(); this.geometry=new Map(); this.layers=[]; this.epoch=0; this.dead=false; this.signature=''; this.options=defaultContours();
    this.canvas=document.createElement('canvas'); this.canvas.dataset.synopticContours='map'; this.canvas.setAttribute('aria-hidden','true');
    Object.assign(this.canvas.style,{position:'absolute',left:'0',top:'0',pointerEvents:'none',zIndex:'450'}); map.getContainer().appendChild(this.canvas);
  }
  set(options, timestamp, enabled) {
    const safe=safeContourOptions(options), signature=JSON.stringify([safe,timestamp,enabled]);
    if(this.dead || signature===this.signature) return;
    this.signature=signature; this.options=safe; this.timestamp=timestamp; this.enabled=enabled;
    this.epoch++; this.abort?.abort(); clearTimeout(this.timer); this.layers=[]; this.onRender();
    const fields=Object.keys(CONTOUR_FIELDS).filter(k=>safe[k].on);
    if(!enabled || !fields.length) { this.onChange({loading:false,errors:[],active:[]}); return; }
    this.onChange({loading:true,errors:[],active:[]});
    this.timer=setTimeout(()=>void this.load(fields,this.epoch),120);
  }
  async load(fields, epoch) {
    const abort=new AbortController(); this.abort=abort; const timeout=setTimeout(()=>abort.abort(),45000), errors=[];
    try {
      if(!this.manifest || Date.now()-this.manifestAt>300000) {
        const response=await this.fetcher(this.base+'latest.json?t='+Math.floor(Date.now()/300000),{signal:abort.signal});
        if(!response.ok) throw Error('Contour index unavailable (HTTP '+response.status+')');
        const text=await response.text(); if(text.length>50000) throw Error('Contour index exceeds size limit');
        const m=validateContourManifest(JSON.parse(text));
        if(this.manifest && m.runTime<this.manifest.runTime) throw Error('Server returned an older contour run');
        if(this.dead || epoch!==this.epoch) return; this.manifest=m; this.manifestAt=Date.now();
      }
      const m=validateContourManifest(this.manifest), frame=contourSnapshot(m,this.timestamp);
      if(!frame) throw Error('No contour snapshot within 90 minutes of the Windy forecast time');
      await Promise.all(fields.map(async field=>{
        const config=this.options[field], key=m.runTime+':'+frame.validTime+':'+field+':'+config.level;
        try {
          let values=this.cache.get(key);
          if(!values) {
            const response=await this.fetcher(this.base+contourPath(m,frame,field,config.level),{signal:abort.signal});
            if(!response.ok) throw Error('HTTP '+response.status);
            values=validateContourField(await decodeFrameResponse(response),m,frame,field,config.level);
          }
          if(this.dead || epoch!==this.epoch || abort.signal.aborted) return;
          this.cache.delete(key); this.cache.set(key,values); while(this.cache.size>9) this.cache.delete(this.cache.keys().next().value);
          const geometryKey=key+':'+config.step;
          let segments=this.geometry.get(geometryKey);
          if(!segments) { segments=contourSegments(values,m.grid,config.step); this.geometry.set(geometryKey,segments); while(this.geometry.size>3) this.geometry.delete(this.geometry.keys().next().value); }
          if(this.dead || epoch!==this.epoch) return;
          this.layers.push({field,level:config.level,segments}); this.layers.sort((a,b)=>Object.keys(CONTOUR_FIELDS).indexOf(a.field)-Object.keys(CONTOUR_FIELDS).indexOf(b.field)); this.onRender();
        } catch(error) { if(epoch===this.epoch) errors.push(CONTOUR_FIELDS[field].label+': '+(error?.name==='AbortError'?'request timed out':error.message)); }
      }));
      if(!this.dead && epoch===this.epoch) this.onChange({loading:false,errors,active:this.layers.map(l=>l.field),validTime:frame.validTime,runTime:m.runTime});
    } catch(error) { if(!this.dead && epoch===this.epoch) this.onChange({loading:false,errors:[error?.name==='AbortError'?'Contour request timed out':error.message],active:[]}); }
    finally { clearTimeout(timeout); }
  }
  paint() {
    if(this.dead) return;
    const size=this.map.getSize(), ratio=Math.min(window.devicePixelRatio||1,2), c=this.canvas;
    if(c.width!==Math.round(size.x*ratio) || c.height!==Math.round(size.y*ratio)) { c.width=Math.round(size.x*ratio); c.height=Math.round(size.y*ratio); }
    c.style.width=size.x+'px'; c.style.height=size.y+'px'; const ctx=c.getContext('2d'); if(!ctx) return;
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const fresh=this.manifest && Date.now()-Date.parse(this.manifest.runTime)<=MAX_RUN_AGE_MS;
    const shown=this.enabled && fresh?this.layers:[];
    c.dataset.layers=shown.map(l=>l.field+':'+l.level).sort().join(',');
    drawContours(ctx,this.map,shown,this.options,size.x,size.y);
  }
  refresh() { this.manifestAt=0; this.signature=''; this.set(this.options,this.timestamp,this.enabled); }
  destroy() { this.dead=true; this.epoch++; this.abort?.abort(); clearTimeout(this.timer); this.cache.clear(); this.geometry.clear(); this.layers=[]; this.canvas.remove(); }
}

/* src/pluginEntry.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-1pobaud", ".panel.svelte-1pobaud.svelte-1pobaud,.restore.svelte-1pobaud.svelte-1pobaud{position:fixed;left:12px;bottom:95px;z-index:1100;background:#142536;color:#f0f5f8;border:1px solid #42586b;border-radius:14px;box-shadow:0 8px 28px #0005;font:13px/1.5 system-ui,sans-serif}.panel.svelte-1pobaud.svelte-1pobaud{width:320px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 180px);overflow:auto;padding:16px;box-sizing:border-box}.restore.svelte-1pobaud.svelte-1pobaud{padding:12px}header.svelte-1pobaud.svelte-1pobaud{display:flex;justify-content:space-between;gap:10px}header.svelte-1pobaud strong.svelte-1pobaud{font-size:20px}small.svelte-1pobaud.svelte-1pobaud{display:block;font-size:11px;color:#bbcad6}button.svelte-1pobaud.svelte-1pobaud,select.svelte-1pobaud.svelte-1pobaud,input.svelte-1pobaud.svelte-1pobaud{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:7px;padding:5px 7px}button.svelte-1pobaud.svelte-1pobaud,select.svelte-1pobaud.svelte-1pobaud{cursor:pointer}button.svelte-1pobaud.svelte-1pobaud:disabled,select.svelte-1pobaud.svelte-1pobaud:disabled{opacity:.5;cursor:default}button.svelte-1pobaud.svelte-1pobaud:focus-visible,select.svelte-1pobaud.svelte-1pobaud:focus-visible,input.svelte-1pobaud.svelte-1pobaud:focus-visible{outline:2px solid #f9a825;outline-offset:2px}label.svelte-1pobaud.svelte-1pobaud{display:flex;align-items:center;gap:4px}input[type=checkbox].svelte-1pobaud.svelte-1pobaud{accent-color:#f9a825}.toolbar.svelte-1pobaud.svelte-1pobaud{display:flex;align-items:center;gap:6px;margin:14px 0}.toolbar.svelte-1pobaud button.svelte-1pobaud{font-size:11px}.toolbar.svelte-1pobaud label.svelte-1pobaud{margin-left:auto}.row.svelte-1pobaud.svelte-1pobaud{border-top:1px solid #42586b;padding:12px 0}.toggle.svelte-1pobaud.svelte-1pobaud{font-size:12px;gap:7px}.settings.svelte-1pobaud.svelte-1pobaud{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:8px}.settings.svelte-1pobaud label.svelte-1pobaud{font-size:11px}.settings.svelte-1pobaud select.svelte-1pobaud{font-size:11px;padding:4px}.settings.svelte-1pobaud input[type=color].svelte-1pobaud{width:30px;height:28px;padding:2px;flex-shrink:0}.labels.svelte-1pobaud.svelte-1pobaud{border-top:1px solid #42586b;padding-top:12px}.stamp.svelte-1pobaud.svelte-1pobaud{background:#21384a;padding:10px;border-radius:8px;font-size:12px}.error.svelte-1pobaud.svelte-1pobaud{background:#692f30;padding:9px;border-radius:7px;font-size:12px}.hint.svelte-1pobaud.svelte-1pobaud,details.svelte-1pobaud p.svelte-1pobaud{font-size:11px;color:#bbcad6}.refresh.svelte-1pobaud.svelte-1pobaud{margin:10px 0}summary.svelte-1pobaud.svelte-1pobaud{cursor:pointer;font-size:12px}@media(max-width:600px){.panel.svelte-1pobaud.svelte-1pobaud{bottom:100px;width:295px;max-height:72dvh;padding:12px}.restore.svelte-1pobaud.svelte-1pobaud{bottom:100px}}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[27] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[30] = list[i];
	child_ctx[31] = list;
	child_ctx[32] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[33] = list[i];
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[36] = list[i];
	return child_ctx;
}

// (66:0) {:else}
function create_else_block(ctx) {
	let section;
	let header;
	let div0;
	let strong;
	let small0;
	let button0;
	let t4;
	let div1;
	let button1;
	let t5;
	let button1_disabled_value;
	let button2;
	let label0;
	let input0;
	let t7;
	let t8;
	let t9;
	let label1;
	let input1;
	let t10;
	let t11;
	let t12;
	let t13;
	let t14;
	let small1;
	let t15;
	let t16_value = /*displayTime*/ ctx[6](/*timestamp*/ ctx[3]) + "";
	let t16;
	let t17;
	let t18;
	let button3;
	let t19;
	let button3_disabled_value;
	let t20;
	let details;
	let mounted;
	let dispose;
	let each_value_1 = ensure_array_like(Object.keys(CONTOUR_FIELDS));
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	let if_block0 = /*status*/ ctx[5].loading && create_if_block_3();
	let each_value = ensure_array_like(/*status*/ ctx[5].errors);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	function select_block_type_2(ctx, dirty) {
		if (/*status*/ ctx[5].validTime && /*status*/ ctx[5].active.length) return create_if_block_1;
		if (!/*status*/ ctx[5].loading && !/*status*/ ctx[5].errors.length) return create_if_block_2;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block1 = current_block_type && current_block_type(ctx);

	return {
		c() {
			section = element("section");
			header = element("header");
			div0 = element("div");
			strong = element("strong");
			strong.textContent = `${config.title}`;
			small0 = element("small");
			small0.textContent = `Weather isolines · v${config.version}`;
			button0 = element("button");
			button0.textContent = "−";
			t4 = space();
			div1 = element("div");
			button1 = element("button");
			t5 = text("Synoptic preset");
			button2 = element("button");
			button2.textContent = "Clear all";
			label0 = element("label");
			input0 = element("input");
			t7 = text("On");
			t8 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t9 = space();
			label1 = element("label");
			input1 = element("input");
			t10 = text("Show labels with levels and units");
			t11 = space();
			if (if_block0) if_block0.c();
			t12 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t13 = space();
			if (if_block1) if_block1.c();
			t14 = space();
			small1 = element("small");
			t15 = text("Forecast time: ");
			t16 = text(t16_value);
			t17 = text(" · device timezone");
			t18 = space();
			button3 = element("button");
			t19 = text("Refresh");
			t20 = space();
			details = element("details");
			details.innerHTML = `<summary class="svelte-1pobaud">Source and interpretation</summary><p class="svelte-1pobaud">NASA GEOS-FP, sampled on a 1.25° grid. Three-hourly instantaneous snapshots follow the nearest available time within 90 minutes of Windy&#39;s timeline. Exact valid time and source run are shown above.</p><p class="svelte-1pobaud">Height: dam (1 dam = 10 m). Temperature: Celsius. MSLP: hPa. Upper-air values below terrain are masked; missing cells leave gaps. Forecast availability depends on the source cycle.</p><p class="svelte-1pobaud">Each checkbox is independent. These layers share the map with Windy&#39;s selected background and do not change its forecast model or native isolines.</p>`;
			attr(strong, "class", "svelte-1pobaud");
			attr(small0, "class", "svelte-1pobaud");
			attr(button0, "aria-label", "Minimize panel");
			attr(button0, "class", "svelte-1pobaud");
			attr(header, "class", "svelte-1pobaud");
			button1.disabled = button1_disabled_value = !/*enabled*/ ctx[2];
			attr(button1, "class", "svelte-1pobaud");
			attr(button2, "class", "svelte-1pobaud");
			attr(input0, "aria-label", "Enable isolines");
			attr(input0, "type", "checkbox");
			attr(input0, "class", "svelte-1pobaud");
			attr(label0, "class", "svelte-1pobaud");
			attr(div1, "class", "toolbar svelte-1pobaud");
			attr(input1, "aria-label", "Contour labels");
			attr(input1, "type", "checkbox");
			attr(input1, "class", "svelte-1pobaud");
			attr(label1, "class", "toggle labels svelte-1pobaud");
			attr(small1, "class", "svelte-1pobaud");
			attr(button3, "class", "refresh svelte-1pobaud");
			button3.disabled = button3_disabled_value = !/*enabled*/ ctx[2] || /*status*/ ctx[5].loading;
			attr(details, "class", "svelte-1pobaud");
			attr(section, "class", "panel svelte-1pobaud");
			attr(section, "aria-label", "Synoptic Atlas");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, header);
			append(header, div0);
			append(div0, strong);
			append(div0, small0);
			append(header, button0);
			append(section, t4);
			append(section, div1);
			append(div1, button1);
			append(button1, t5);
			append(div1, button2);
			append(div1, label0);
			append(label0, input0);
			input0.checked = /*enabled*/ ctx[2];
			append(label0, t7);
			append(section, t8);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				if (each_blocks_1[i]) {
					each_blocks_1[i].m(section, null);
				}
			}

			append(section, t9);
			append(section, label1);
			append(label1, input1);
			input1.checked = /*options*/ ctx[0].labels;
			append(label1, t10);
			append(section, t11);
			if (if_block0) if_block0.m(section, null);
			append(section, t12);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(section, null);
				}
			}

			append(section, t13);
			if (if_block1) if_block1.m(section, null);
			append(section, t14);
			append(section, small1);
			append(small1, t15);
			append(small1, t16);
			append(small1, t17);
			append(section, t18);
			append(section, button3);
			append(button3, t19);
			append(section, t20);
			append(section, details);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler_1*/ ctx[12]),
					listen(button1, "click", /*preset*/ ctx[8]),
					listen(button2, "click", /*clear*/ ctx[9]),
					listen(input0, "change", /*input0_change_handler*/ ctx[13]),
					listen(input1, "change", /*input1_change_handler*/ ctx[18]),
					listen(input1, "change", /*save*/ ctx[7]),
					listen(button3, "click", /*click_handler_2*/ ctx[19])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*enabled*/ 4 && button1_disabled_value !== (button1_disabled_value = !/*enabled*/ ctx[2])) {
				button1.disabled = button1_disabled_value;
			}

			if (dirty[0] & /*enabled*/ 4) {
				input0.checked = /*enabled*/ ctx[2];
			}

			if (dirty[0] & /*enabled, options, save*/ 133) {
				each_value_1 = ensure_array_like(Object.keys(CONTOUR_FIELDS));
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_1(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(section, t9);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_1.length;
			}

			if (dirty[0] & /*options*/ 1) {
				input1.checked = /*options*/ ctx[0].labels;
			}

			if (/*status*/ ctx[5].loading) {
				if (if_block0) ; else {
					if_block0 = create_if_block_3();
					if_block0.c();
					if_block0.m(section, t12);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*status*/ 32) {
				each_value = ensure_array_like(/*status*/ ctx[5].errors);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(section, t13);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if (if_block1) if_block1.d(1);
				if_block1 = current_block_type && current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(section, t14);
				}
			}

			if (dirty[0] & /*timestamp*/ 8 && t16_value !== (t16_value = /*displayTime*/ ctx[6](/*timestamp*/ ctx[3]) + "")) set_data(t16, t16_value);

			if (dirty[0] & /*enabled, status*/ 36 && button3_disabled_value !== (button3_disabled_value = !/*enabled*/ ctx[2] || /*status*/ ctx[5].loading)) {
				button3.disabled = button3_disabled_value;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(section);
			}

			destroy_each(each_blocks_1, detaching);
			if (if_block0) if_block0.d();
			destroy_each(each_blocks, detaching);

			if (if_block1) {
				if_block1.d();
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

// (64:0) {#if hidden}
function create_if_block(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "Synoptic Atlas";
			attr(button, "class", "restore svelte-1pobaud");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[11]);
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

// (74:256) {:else}
function create_else_block_1(ctx) {
	let small;

	return {
		c() {
			small = element("small");
			small.textContent = "Mean sea level";
			attr(small, "class", "svelte-1pobaud");
		},
		m(target, anchor) {
			insert(target, small, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (74:10) {#if key !== 'mslp'}
function create_if_block_4(ctx) {
	let select;
	let select_disabled_value;
	let mounted;
	let dispose;
	let each_value_3 = ensure_array_like(PRESSURE_LEVELS);
	let each_blocks = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	function select_change_handler() {
		/*select_change_handler*/ ctx[15].call(select, /*key*/ ctx[30]);
	}

	return {
		c() {
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(select, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[30]].label + ' pressure level');
			select.disabled = select_disabled_value = !/*enabled*/ ctx[2];
			attr(select, "class", "svelte-1pobaud");
			if (/*options*/ ctx[0][/*key*/ ctx[30]].level === void 0) add_render_callback(select_change_handler);
		},
		m(target, anchor) {
			insert(target, select, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*options*/ ctx[0][/*key*/ ctx[30]].level, true);

			if (!mounted) {
				dispose = [
					listen(select, "change", select_change_handler),
					listen(select, "change", /*save*/ ctx[7])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*enabled*/ 4 && select_disabled_value !== (select_disabled_value = !/*enabled*/ ctx[2])) {
				select.disabled = select_disabled_value;
			}

			if (dirty[0] & /*options*/ 1) {
				select_option(select, /*options*/ ctx[0][/*key*/ ctx[30]].level);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(select);
			}

			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (74:166) {#each PRESSURE_LEVELS as level}
function create_each_block_3(ctx) {
	let option;

	return {
		c() {
			option = element("option");
			option.textContent = `${/*level*/ ctx[36]} hPa`;
			option.__value = /*level*/ ctx[36];
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(option);
			}
		}
	};
}

// (75:158) {#each CONTOUR_FIELDS[key].steps as step}
function create_each_block_2(ctx) {
	let option;
	let t0_value = /*step*/ ctx[33] + "";
	let t0;
	let t1;

	let t2_value = (/*key*/ ctx[30] === 'temp'
	? '°C'
	: CONTOUR_FIELDS[/*key*/ ctx[30]].units) + "";

	let t2;

	return {
		c() {
			option = element("option");
			t0 = text(t0_value);
			t1 = space();
			t2 = text(t2_value);
			option.__value = /*step*/ ctx[33];
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t0);
			append(option, t1);
			append(option, t2);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(option);
			}
		}
	};
}

// (70:4) {#each Object.keys(CONTOUR_FIELDS) as key}
function create_each_block_1(ctx) {
	let div1;
	let label0;
	let input0;
	let input0_disabled_value;
	let span;
	let t0_value = CONTOUR_FIELDS[/*key*/ ctx[30]].label + "";
	let t0;
	let span_style_value;
	let t1;
	let div0;
	let t2;
	let label1;
	let t3;
	let select;
	let select_disabled_value;
	let t4;
	let input1;
	let input1_disabled_value;
	let mounted;
	let dispose;

	function input0_change_handler_1() {
		/*input0_change_handler_1*/ ctx[14].call(input0, /*key*/ ctx[30]);
	}

	function select_block_type_1(ctx, dirty) {
		if (/*key*/ ctx[30] !== 'mslp') return create_if_block_4;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);
	let each_value_2 = ensure_array_like(CONTOUR_FIELDS[/*key*/ ctx[30]].steps);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	function select_change_handler_1() {
		/*select_change_handler_1*/ ctx[16].call(select, /*key*/ ctx[30]);
	}

	function input1_input_handler() {
		/*input1_input_handler*/ ctx[17].call(input1, /*key*/ ctx[30]);
	}

	return {
		c() {
			div1 = element("div");
			label0 = element("label");
			input0 = element("input");
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			div0 = element("div");
			if_block.c();
			t2 = space();
			label1 = element("label");
			t3 = text("Every");
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t4 = space();
			input1 = element("input");
			attr(input0, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[30]].label + ' isolines');
			attr(input0, "type", "checkbox");
			input0.disabled = input0_disabled_value = !/*enabled*/ ctx[2];
			attr(input0, "class", "svelte-1pobaud");
			attr(span, "style", span_style_value = 'color:' + /*options*/ ctx[0][/*key*/ ctx[30]].color);
			attr(label0, "class", "toggle svelte-1pobaud");
			attr(select, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[30]].label + ' contour spacing');
			select.disabled = select_disabled_value = !/*enabled*/ ctx[2];
			attr(select, "class", "svelte-1pobaud");
			if (/*options*/ ctx[0][/*key*/ ctx[30]].step === void 0) add_render_callback(select_change_handler_1);
			attr(label1, "class", "svelte-1pobaud");
			attr(input1, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[30]].label + ' contour color');
			attr(input1, "type", "color");
			input1.disabled = input1_disabled_value = !/*enabled*/ ctx[2];
			attr(input1, "class", "svelte-1pobaud");
			attr(div0, "class", "settings svelte-1pobaud");
			attr(div1, "class", "row svelte-1pobaud");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, label0);
			append(label0, input0);
			input0.checked = /*options*/ ctx[0][/*key*/ ctx[30]].on;
			append(label0, span);
			append(span, t0);
			append(div1, t1);
			append(div1, div0);
			if_block.m(div0, null);
			append(div0, t2);
			append(div0, label1);
			append(label1, t3);
			append(label1, select);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*options*/ ctx[0][/*key*/ ctx[30]].step, true);
			append(div0, t4);
			append(div0, input1);
			set_input_value(input1, /*options*/ ctx[0][/*key*/ ctx[30]].color);

			if (!mounted) {
				dispose = [
					listen(input0, "change", input0_change_handler_1),
					listen(input0, "change", /*save*/ ctx[7]),
					listen(select, "change", select_change_handler_1),
					listen(select, "change", /*save*/ ctx[7]),
					listen(input1, "input", input1_input_handler),
					listen(input1, "change", /*save*/ ctx[7])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*enabled*/ 4 && input0_disabled_value !== (input0_disabled_value = !/*enabled*/ ctx[2])) {
				input0.disabled = input0_disabled_value;
			}

			if (dirty[0] & /*options*/ 1) {
				input0.checked = /*options*/ ctx[0][/*key*/ ctx[30]].on;
			}

			if (dirty[0] & /*options*/ 1 && span_style_value !== (span_style_value = 'color:' + /*options*/ ctx[0][/*key*/ ctx[30]].color)) {
				attr(span, "style", span_style_value);
			}

			if_block.p(ctx, dirty);

			if (dirty & /*Object*/ 0) {
				each_value_2 = ensure_array_like(CONTOUR_FIELDS[/*key*/ ctx[30]].steps);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}

			if (dirty[0] & /*enabled*/ 4 && select_disabled_value !== (select_disabled_value = !/*enabled*/ ctx[2])) {
				select.disabled = select_disabled_value;
			}

			if (dirty[0] & /*options*/ 1) {
				select_option(select, /*options*/ ctx[0][/*key*/ ctx[30]].step);
			}

			if (dirty[0] & /*enabled*/ 4 && input1_disabled_value !== (input1_disabled_value = !/*enabled*/ ctx[2])) {
				input1.disabled = input1_disabled_value;
			}

			if (dirty[0] & /*options*/ 1) {
				set_input_value(input1, /*options*/ ctx[0][/*key*/ ctx[30]].color);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			if_block.d();
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (81:4) {#if status.loading}
function create_if_block_3(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Loading GEOS isolines…";
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

// (82:4) {#each status.errors as message}
function create_each_block(ctx) {
	let p;
	let t_value = /*message*/ ctx[27] + "";
	let t;

	return {
		c() {
			p = element("p");
			t = text(t_value);
			attr(p, "class", "error svelte-1pobaud");
			attr(p, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*status*/ 32 && t_value !== (t_value = /*message*/ ctx[27] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (84:55) 
function create_if_block_2(ctx) {
	let p;

	let t_value = (/*enabled*/ ctx[2]
	? 'Tick any layer, or choose Synoptic preset to show all three.'
	: 'Isolines disabled.') + "";

	let t;

	return {
		c() {
			p = element("p");
			t = text(t_value);
			attr(p, "class", "hint svelte-1pobaud");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*enabled*/ 4 && t_value !== (t_value = (/*enabled*/ ctx[2]
			? 'Tick any layer, or choose Synoptic preset to show all three.'
			: 'Isolines disabled.') + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (83:4) {#if status.validTime && status.active.length}
function create_if_block_1(ctx) {
	let p;
	let t0;
	let t1_value = /*displayTime*/ ctx[6](/*status*/ ctx[5].validTime) + "";
	let t1;
	let small;
	let t2;
	let t3_value = new Date(/*status*/ ctx[5].runTime).toISOString().slice(0, 16).replace('T', ' ') + "";
	let t3;
	let t4;

	return {
		c() {
			p = element("p");
			t0 = text("Valid ");
			t1 = text(t1_value);
			small = element("small");
			t2 = text("GEOS run ");
			t3 = text(t3_value);
			t4 = text(" UTC");
			attr(small, "class", "svelte-1pobaud");
			attr(p, "class", "stamp svelte-1pobaud");
			attr(p, "data-testid", "contour-time");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t0);
			append(p, t1);
			append(p, small);
			append(small, t2);
			append(small, t3);
			append(small, t4);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*status*/ 32 && t1_value !== (t1_value = /*displayTime*/ ctx[6](/*status*/ ctx[5].validTime) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*status*/ 32 && t3_value !== (t3_value = new Date(/*status*/ ctx[5].runTime).toISOString().slice(0, 16).replace('T', ' ') + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

function create_fragment(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*hidden*/ ctx[4]) return create_if_block;
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

function instance($$self, $$props, $$invalidate) {
	let options = defaultContours(),
		layer = null,
		enabled = true,
		hidden = false,
		destroyed = false;

	let timestamp = Date.now(), status = { loading: false, errors: [], active: [] };
	let listener, timer, clock, animation = 0, observer = null;

	const displayTime = value => new Date(value).toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	function save() {
		try {
			localStorage.setItem('synoptic-atlas.options.v1', JSON.stringify(options));
		} catch {
			
		}
	}

	function preset() {
		$$invalidate(0, options = {
			...options,
			gh: { ...options.gh, on: true, level: 500 },
			temp: { ...options.temp, on: true, level: 850 },
			mslp: { ...options.mslp, on: true }
		});

		save();
	}

	function clear() {
		$$invalidate(0, options = {
			...options,
			...Object.fromEntries(Object.keys(CONTOUR_FIELDS).map(k => [k, { ...options[k], on: false }]))
		});

		save();
	}

	function render() {
		if (destroyed || animation) return;

		animation = requestAnimationFrame(() => {
			animation = 0;
			layer?.paint();
		});
	}

	const onopen = () => {
		$$invalidate(4, hidden = false);
	};

	onMount(() => {
		try {
			$$invalidate(0, options = safeContourOptions(JSON.parse(localStorage.getItem('synoptic-atlas.options.v1') || 'null')));
		} catch {
			
		}

		$$invalidate(3, timestamp = Number(store.get('timestamp')) || Date.now());

		$$invalidate(1, layer = new ContourOverlay({
				map,
				onChange: value => {
					$$invalidate(5, status = value);
				},
				onRender: render
			}));

		listener = store.on('timestamp', () => {
			$$invalidate(3, timestamp = Number(store.get('timestamp')));
		});

		map.on('move', render);
		map.on('zoom', render);
		map.on('resize', render);

		if (typeof ResizeObserver !== 'undefined') {
			observer = new ResizeObserver(render);
			observer.observe(map.getContainer());
		}

		timer = setInterval(
			() => {
				if (enabled && !document.hidden) layer?.refresh();
			},
			300000
		);

		clock = setInterval(render, 60000);
		render();
	});

	onDestroy(() => {
		destroyed = true;
		layer?.destroy();
		$$invalidate(1, layer = null);
		if (animation) cancelAnimationFrame(animation);
		clearInterval(timer);
		clearInterval(clock);
		observer?.disconnect();
		map.off('move', render);
		map.off('zoom', render);
		map.off('resize', render);
		if (listener != null) store.off(listener);
	});

	const click_handler = () => $$invalidate(4, hidden = false);
	const click_handler_1 = () => $$invalidate(4, hidden = true);

	function input0_change_handler() {
		enabled = this.checked;
		$$invalidate(2, enabled);
	}

	function input0_change_handler_1(key) {
		options[key].on = this.checked;
		$$invalidate(0, options);
	}

	function select_change_handler(key) {
		options[key].level = select_value(this);
		$$invalidate(0, options);
	}

	function select_change_handler_1(key) {
		options[key].step = select_value(this);
		$$invalidate(0, options);
	}

	function input1_input_handler(key) {
		options[key].color = this.value;
		$$invalidate(0, options);
	}

	function input1_change_handler() {
		options.labels = this.checked;
		$$invalidate(0, options);
	}

	const click_handler_2 = () => layer?.refresh();

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*layer, options, timestamp, enabled*/ 15) {
			if (layer) layer.set(options, timestamp, enabled);
		}
	};

	return [
		options,
		layer,
		enabled,
		timestamp,
		hidden,
		status,
		displayTime,
		save,
		preset,
		clear,
		onopen,
		click_handler,
		click_handler_1,
		input0_change_handler,
		input0_change_handler_1,
		select_change_handler,
		select_change_handler_1,
		input1_input_handler,
		input1_change_handler,
		click_handler_2
	];
}

class PluginEntry extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 10 }, add_css, [-1, -1]);
	}

	get onopen() {
		return this.$$.ctx[10];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, PluginEntry as default };
//# sourceMappingURL=plugin.js.map
