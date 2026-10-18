const __pluginConfig =  {
  "name": "windy-plugin-jordan-dust-fog",
  "version": "1.1.0",
  "icon": "🌫️",
  "title": "Synoptic Atlas",
  "description": "Global GEOS-FP dust, independent geopotential height, temperature and MSLP contours, and satellite imagery.",
  "author": "Ramzi Kandah",
  "repository": "https://github.com/ramzik99/jordan-dust-fog",
  "desktopUI": "embedded",
  "mobileUI": "small",
  "addToContextmenu": true,
  "listenToSingleclick": true,
  "built": 1792340039912,
  "builtReadable": "2026-10-18T16:13:59.912Z"
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
	if (!mounting || value !== undefined) {
		select.selectedIndex = -1; // no option should be selected
	}
}

function select_value(select) {
	const selected_option = select.querySelector(':checked');
	return selected_option && selected_option.__value;
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
const validDate$1 = value => typeof value === 'string' && value.endsWith('Z') && Number.isFinite(Date.parse(value));
function increasing(values) {
  return Array.isArray(values) && values.length > 0 && values.every((v, i) =>
    Number.isFinite(v) && (i === 0 || v > values[i - 1]));
}
function frameAt(data, timestamp) {
  if (!Number.isFinite(timestamp)) return null;
  return data?.frames.find(f => timestamp >= Date.parse(f.start) && timestamp < Date.parse(f.end)) ?? null;
}
function samplePoint(data, frame, lat, lon) {
  if (!frame || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const ys = data.latitudes, xs = data.longitudes;
  lon = wrapLongitude(lon);
  if (lat < ys[0] || lat > ys.at(-1) || (false)) return null;
  const nearest = (a, value) => a.reduce((best, v, i) => Math.abs(v - value) < Math.abs(a[best] - value) ? i : best, 0);
  const y = nearest(ys, lat);
  const x = xs.reduce((best, v, i) => Math.abs(wrapLongitude(v - lon)) < Math.abs(wrapLongitude(xs[best] - lon)) ? i : best, 0) ;
  return { lat: ys[y], lon: xs[x], ...Object.fromEntries(FIELDS.map(k => [k, fieldValue(frame[k], y, x, xs.length)])) };
}
function fieldValue(values, y, x, width) {
  const value = ArrayBuffer.isView(values) ? values[y * width + x] : values?.[y]?.[x];
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function wrapLongitude(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function validateManifest(data, now = Date.now()) {
  if (data?.schemaVersion !== 2 || data.coverage !== 'global' || data.source !== 'NASA GEOS-FP') throw Error('Unsupported global manifest');
  if (!validDate$1(data.runTime) || !validDate$1(data.retrievedAt)) throw Error('Invalid source timestamps');
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
    if (![f.start, f.end, f.validTime].every(validDate$1)) throw Error('Invalid frame times');
    const start = Date.parse(f.start), end = Date.parse(f.end);
    if (start < run || start < lastEnd || end - start !== 10800000 || Date.parse(f.validTime) !== (start + end) / 2) throw Error('Invalid or overlapping averaging intervals');
    const stamp = f.validTime.replaceAll('-', '').replaceAll(':', '');
    if (f.path !== `runs/${token}/${stamp}.json.gz` || paths.has(f.path)) throw Error('Invalid forecast path');
    paths.add(f.path); lastEnd = end;
  }
  if (lastEnd <= now) throw Error('Forecast has expired');
  return data;
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

const DATA_BASE = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/geos-dust-data/global/';
const NATIVE_GRID = {
  coverage: 'global', latitudes: Array.from({ length: 721 }, (_, i) => -90 + i * .25),
  longitudes: Array.from({ length: 1152 }, (_, i) => -180 + i * .3125),
  sampling: { latitudeDegrees: .25, longitudeDegrees: .3125 },
};
function abortError() { return new DOMException('Request cancelled', 'AbortError'); }
function validateDustManifest(manifest, now = Date.now()) {
  validateManifest(manifest, now);
  if (manifest.nativeResolution?.latitudeDegrees !== .25 || manifest.nativeResolution?.longitudeDegrees !== .3125) throw Error('Unexpected native GEOS resolution');
  for (const frame of manifest.frames) {
    const info = frame.native;
    const token = manifest.runTime.slice(0, 10).replaceAll('-', '') + '_' + manifest.runTime.slice(11, 13);
    const stamp = frame.validTime.replaceAll('-', '').replaceAll(':', '');
    if (!info || info.encoding !== 'log16-rgb-pair-v1' || info.width !== 1152 || info.height !== 721 ||
        info.massPath !== 'native/runs/' + token + '/' + stamp + '.mass.png' ||
        info.opticsPath !== 'native/runs/' + token + '/' + stamp + '.optics.png' ||
        FIELDS.some(key => !Number.isFinite(info.scales?.[key]) || info.scales[key] <= 0 || info.scales[key] > 1)) throw Error('Invalid native dust descriptor');
  }
  return manifest;
}
async function readPngPixels(response, width, height) {
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length > 8 * 1024 * 1024 || bytes.length < 26) throw Error('Invalid native image size');
  const view = new DataView(bytes.buffer);
  const magic = [137, 80, 78, 71, 13, 10, 26, 10];
  if (magic.some((v, i) => bytes[i] !== v) || view.getUint32(16) !== width || view.getUint32(20) !== height || bytes[24] !== 8 || bytes[25] !== 2) throw Error('Unexpected native image format');
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw Error('Canvas decoding unavailable');
    ctx.imageSmoothingEnabled = false; ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, width, height).data;
  } finally { bitmap.close(); canvas.width = 1; canvas.height = 1; }
}
async function decodeNativePixels(mass, optics, scales, count, signal) {
  if (mass.length !== count * 4 || optics.length !== count * 4) throw Error('Invalid native pixel length');
  const result = Object.fromEntries(FIELDS.map(key => [key, new Float32Array(count)]));
  for (let start = 0; start < count; start += 65536) {
    if (signal?.aborted) throw abortError();
    const end = Math.min(count, start + 65536);
    for (let i = start; i < end; i++) {
      const p = i * 4;
      const a = mass[p] * 256 + mass[p + 1], b = mass[p + 2] * 256 + optics[p], c = optics[p + 1] * 256 + optics[p + 2];
      result.dustSurface[i] = a === 65535 ? NaN : Math.expm1(a * scales.dustSurface);
      result.dustFine[i] = b === 65535 ? NaN : Math.expm1(b * scales.dustFine);
      result.dustAod[i] = c === 65535 ? NaN : Math.expm1(c * scales.dustAod);
    }
    if (end < count) await new Promise(resolve => setTimeout(resolve, 0));
  }
  return result;
}
class NativeForecast {
  constructor({ base = DATA_BASE, fetcher = (...args) => globalThis.fetch(...args), decoder = readPngPixels, cacheSize = 2 } = {}) {
    this.base = base; this.fetcher = fetcher; this.decoder = decoder; this.cacheSize = cacheSize;
    this.cache = new Map(); this.pending = new Map(); this.destroyed = false;
  }
  key(manifest, descriptor) { return manifest.runTime + ':' + descriptor.validTime + ':' + FIELDS.map(k => descriptor.native.scales[k]).join(','); }
  async read(manifest, descriptor, signal) {
    const info = descriptor.native;
    const responses = await Promise.all([info.massPath, info.opticsPath].map(async path => {
      const response = await this.fetcher(this.base + path, { signal });
      if (!response.ok) throw Error('Native GEOS data unavailable (HTTP ' + response.status + ')');
      return this.decoder(response, info.width, info.height);
    }));
    const fields = await decodeNativePixels(responses[0], responses[1], info.scales, info.width * info.height, signal);
    return { ...fields, start: descriptor.start, end: descriptor.end, validTime: descriptor.validTime, runTime: manifest.runTime };
  }
  get(manifest, descriptor, signal) {
    if (this.destroyed || signal?.aborted) return Promise.reject(abortError());
    validateDustManifest(manifest);
    const canonical = manifest.frames.find(f => f === descriptor || f.validTime === descriptor?.validTime && f.native.massPath === descriptor.native?.massPath);
    if (!canonical) return Promise.reject(Error('Unknown native period'));
    descriptor = canonical;
    const key = this.key(manifest, descriptor);
    if (this.cache.has(key)) {
      const frame = this.cache.get(key); this.cache.delete(key); this.cache.set(key, frame); return Promise.resolve(frame);
    }
    let entry = this.pending.get(key);
    if (!entry || entry.controller.signal.aborted) {
      const controller = new AbortController(); entry = { controller, users: new Set(), promise: null };
      this.pending.set(key, entry);
      const current = entry, timeout = setTimeout(() => controller.abort(), 45000);
      current.promise = this.read(manifest, descriptor, controller.signal).then(frame => {
        if (!this.destroyed && !controller.signal.aborted) {
          this.cache.set(key, frame); while (this.cache.size > this.cacheSize) this.cache.delete(this.cache.keys().next().value);
        }
        return frame;
      }).catch(error => { controller.abort(); throw error; }).finally(() => { clearTimeout(timeout); if (this.pending.get(key) === current) this.pending.delete(key); });
    }
    return new Promise((resolve, reject) => {
      const token = Symbol(); entry.users.add(token); let settled = false;
      const cleanup = () => { entry.users.delete(token); signal?.removeEventListener('abort', cancel); };
      const cancel = () => { if (settled) return; settled = true; cleanup(); if (!entry.users.size) entry.controller.abort(); reject(abortError()); };
      signal?.addEventListener('abort', cancel, { once: true });
      entry.promise.then(frame => { if (!settled) { settled = true; cleanup(); resolve(frame); } }, error => { if (!settled) { settled = true; cleanup(); reject(error); } });
    });
  }
  destroy() { this.destroyed = true; for (const entry of this.pending.values()) entry.controller.abort(); this.pending.clear(); this.cache.clear(); }
}

function worldCopies(west, east) {
  if (![west, east].every(Number.isFinite) || east < west) return [];
  const middle = Math.floor(((west + east) / 2 + 180) / 360);
  const lo = Math.max(middle - 3, Math.floor((west + 180) / 360) - 1);
  const hi = Math.min(middle + 3, Math.floor((east + 180) / 360) + 1);
  return Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => (lo + i) * 360);
}

const FIELD_INFO = {
  dustSurface: { label: 'Surface dust', units: 'µg/m³', stops: [0, 50, 100, 300, 1000, 3000] },
  dustFine: { label: 'Fine dust · PM₂.₅ component', units: 'µg/m³', stops: [0, 10, 25, 50, 100, 300] },
  dustAod: { label: 'Dust optical depth', units: '', stops: [0, .1, .3, .6, 1.5, 3] },
};
const PALETTE = [[245, 242, 224], [253, 224, 163], [249, 168, 37], [227, 108, 35], [182, 66, 49], [93, 36, 55]];
function colorFor(value, field = 'dustSurface') {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  const stops = FIELD_INFO[field].stops;
  let i = 0; while (i < stops.length - 1 && value > stops[i + 1]) i++;
  if (i === stops.length - 1) return PALETTE[i];
  const fraction = Math.max(0, Math.min(1, (Math.log1p(value) - Math.log1p(stops[i])) / (Math.log1p(stops[i + 1]) - Math.log1p(stops[i]))));
  return PALETTE[i].map((c, channel) => Math.round(c + fraction * (PALETTE[i + 1][channel] - c)));
}
function makeTexture(grid, frame, field, canvasFactory = () => document.createElement('canvas')) {
  const canvas = canvasFactory(); canvas.width = grid.longitudes.length; canvas.height = grid.latitudes.length;
  const ctx = canvas.getContext('2d'); if (!ctx) throw Error('Canvas rendering unavailable');
  const pixels = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const color = colorFor(fieldValue(frame[field], y, x, canvas.width), field); if (!color) continue;
    const p = (y * canvas.width + x) * 4; pixels.data[p] = color[0]; pixels.data[p + 1] = color[1]; pixels.data[p + 2] = color[2]; pixels.data[p + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0); return canvas;
}
const clampLat$2 = value => Math.max(-85.05112878, Math.min(85.05112878, value));
function drawTexture(ctx, map, grid, texture, width, height, opacity = .6) {
  ctx.clearRect(0, 0, width, height); if (!texture) return;
  const dy = grid.sampling.latitudeDegrees / 2, dx = grid.sampling.longitudeDegrees / 2;
  const b = map.getBounds(); ctx.globalAlpha = opacity; ctx.imageSmoothingEnabled = false;
  for (const offset of worldCopies(b.getWest(), b.getEast())) {
    const left = map.latLngToContainerPoint([0, grid.longitudes[0] + offset - dx]).x;
    const right = map.latLngToContainerPoint([0, grid.longitudes.at(-1) + offset + dx]).x;
    if (right < 0 || left > width) continue;
    for (let y = 0; y < grid.latitudes.length; y++) {
      const top = map.latLngToContainerPoint([clampLat$2(grid.latitudes[y] + dy), 0]).y;
      const bottom = map.latLngToContainerPoint([clampLat$2(grid.latitudes[y] - dy), 0]).y;
      if (bottom < 0 || top > height || bottom <= top) continue;
      ctx.drawImage(texture, 0, y, texture.width, 1, left, top, right - left, bottom - top);
    }
  }
  ctx.globalAlpha = 1;
}
function thresholdState(value, threshold) {
  if (value === null || !Number.isFinite(value) || !Number.isFinite(threshold) || threshold <= 0) return 'unknown';
  return value >= threshold ? 'met' : 'below';
}

const SATELLITES = {
  global: { label: 'Global dust composite', endpoint: 'https://view.eumetsat.int/geoserver/mumi/wms', layer: 'wideareacoverage_rgb_dust', maxAge: 12 * 3600000 },
  meteosat: { label: 'Meteosat Dust RGB', endpoint: 'https://view.eumetsat.int/geoserver/mtg_fd/wms', layer: 'rgb_dust', maxAge: 3600000 },
};
function intervalMs(text) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(text || '');
  return m ? (Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)) * 1000 : NaN;
}
function observationTimes(latest, earliest, cadence, now = Date.now()) {
  const end = Date.parse(latest), start = Date.parse(earliest), step = intervalMs(cadence);
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > now + 600000 || !Number.isFinite(step) || step < 60000) throw Error('Invalid satellite observation times');
  const count = Math.min(37, Math.floor(Math.min(24 * 3600000, end - start) / step) + 1);
  return Array.from({ length: count }, (_, i) => new Date(end - i * step).toISOString());
}
function parseCapabilities(text, layerName, now = Date.now()) {
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length) throw Error('Satellite service returned invalid metadata');
  for (const layer of xml.getElementsByTagNameNS('*', 'Layer')) {
    const children = Array.from(layer.children);
    const name = children.find(c => c.localName === 'Name')?.textContent?.trim().split(':').at(-1);
    if (name !== layerName) continue;
    const dimension = children.find(c => c.localName === 'Dimension' && c.getAttribute('name') === 'time');
    if (!dimension) throw Error('Satellite time metadata unavailable');
    const range = dimension.textContent.trim().split('/');
    const latest = dimension.getAttribute('default') || range[1];
    const times = observationTimes(latest, range[0], range[2], now);
    return { latest: times[0], times, cadence: range[2] };
  }
  throw Error('Requested dust satellite layer unavailable');
}
const R = 6378137, clampLat$1 = lat => Math.max(-85.05112878, Math.min(85.05112878, lat));
const mercatorX = lon => R * lon * Math.PI / 180;
const mercatorY = lat => R * Math.log(Math.tan(Math.PI / 4 + clampLat$1(lat) * Math.PI / 360));
function satelliteRequests(source, time, bounds, size) {
  if (!SATELLITES[source] || !Number.isFinite(Date.parse(time))) throw Error('Invalid satellite request');
  const product = SATELLITES[source], south = clampLat$1(bounds.south), north = clampLat$1(bounds.north);
  if (north <= south || bounds.east <= bounds.west) return [];
  const results = [], density = Math.min(1, 1536 / Math.max(size.width, size.height));
  for (const offset of worldCopies(bounds.west, bounds.east)) {
    const west = Math.max(bounds.west, -180 + offset), east = Math.min(bounds.east, 180 + offset);
    if (east <= west) continue;
    const width = Math.max(1, Math.round(size.width * density * (east - west) / (bounds.east - bounds.west)));
    const height = Math.max(1, Math.round(size.height * density));
    const params = new URLSearchParams({ SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetMap', LAYERS: product.layer,
      STYLES: '', SRS: 'EPSG:3857', BBOX: [mercatorX(west - offset), mercatorY(south), mercatorX(east - offset), mercatorY(north)].join(','),
      WIDTH: String(width), HEIGHT: String(height), FORMAT: 'image/png', TRANSPARENT: 'true', TIME: time });
    results.push({ url: product.endpoint + '?' + params, south, north, west, east });
  }
  return results;
}
async function satelliteMetadata(source, signal) {
  const product = SATELLITES[source]; if (!product) throw Error('Unknown satellite source');
  const response = await fetch(product.endpoint + '?SERVICE=WMS&REQUEST=GetCapabilities', { signal });
  if (!response.ok) throw Error('Satellite metadata unavailable (HTTP ' + response.status + ')');
  const text = await response.text(); if (text.length > 2000000) throw Error('Satellite metadata exceeds limit');
  return parseCapabilities(text, product.layer);
}
async function satelliteFrame(source, time, bounds, size, signal) {
  const requests = satelliteRequests(source, time, bounds, size), completed = [];
  try {
    for (const request of requests) {
      const response = await fetch(request.url, { signal });
      if (!response.ok || !response.headers.get('Content-Type')?.includes('image/')) throw Error('Satellite image unavailable');
      const blob = await response.blob(); if (blob.size > 8 * 1024 * 1024) throw Error('Satellite image exceeds size limit');
      const image = await createImageBitmap(blob);
      if (image.width > 2048 || image.height > 2048) { image.close(); throw Error('Unexpected satellite image dimensions'); }
      completed.push({ ...request, image });
    }
    return { source, time, patches: completed };
  } catch (error) { for (const patch of completed) patch.image.close(); throw error; }
}
function closeSatellite(frame) { for (const patch of frame?.patches || []) patch.image.close(); }
function drawSatellite(ctx, map, frame, width, height, opacity = 1) {
  ctx.clearRect(0, 0, width, height); if (!frame) return;
  ctx.globalAlpha = opacity; ctx.imageSmoothingEnabled = true;
  for (const p of frame.patches) {
    const a = map.latLngToContainerPoint([p.north, p.west]), b = map.latLngToContainerPoint([p.south, p.east]);
    ctx.drawImage(p.image, a.x, a.y, b.x - a.x, b.y - a.y);
  }
  ctx.globalAlpha = 1;
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
	append_styles(target, "svelte-1b6hqhz", ".panel.svelte-1b6hqhz.svelte-1b6hqhz,.restore.svelte-1b6hqhz.svelte-1b6hqhz{position:fixed;left:12px;bottom:95px;z-index:1100;background:#142536;color:#f0f5f8;border:1px solid #42586b;border-radius:14px;box-shadow:0 8px 28px #0005;font:13px/1.5 system-ui,sans-serif}.panel.svelte-1b6hqhz.svelte-1b6hqhz{width:310px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 180px);overflow:auto;padding:16px;box-sizing:border-box}.restore.svelte-1b6hqhz.svelte-1b6hqhz{padding:12px}header.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;justify-content:space-between;gap:10px}header.svelte-1b6hqhz strong.svelte-1b6hqhz{font-size:19px}small.svelte-1b6hqhz.svelte-1b6hqhz{display:block;font-size:11px;color:#bbcad6}button.svelte-1b6hqhz.svelte-1b6hqhz,select.svelte-1b6hqhz.svelte-1b6hqhz,input.svelte-1b6hqhz.svelte-1b6hqhz{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:7px;padding:5px 7px}button.svelte-1b6hqhz.svelte-1b6hqhz,select.svelte-1b6hqhz.svelte-1b6hqhz{cursor:pointer}button.svelte-1b6hqhz.svelte-1b6hqhz:disabled,select.svelte-1b6hqhz.svelte-1b6hqhz:disabled{opacity:.5;cursor:default}button.svelte-1b6hqhz.svelte-1b6hqhz:focus-visible,select.svelte-1b6hqhz.svelte-1b6hqhz:focus-visible,input.svelte-1b6hqhz.svelte-1b6hqhz:focus-visible{outline:2px solid #f9a825;outline-offset:2px}label.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;align-items:center;gap:4px}input[type=checkbox].svelte-1b6hqhz.svelte-1b6hqhz{accent-color:#f9a825}nav.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;align-items:center;gap:6px;margin:14px 0}nav.svelte-1b6hqhz label.svelte-1b6hqhz{margin-left:auto}.active.svelte-1b6hqhz.svelte-1b6hqhz{border-color:#f9a825;background:#39463d}.place.svelte-1b6hqhz.svelte-1b6hqhz{justify-content:space-between;margin:10px 0 5px}.place.svelte-1b6hqhz select.svelte-1b6hqhz{max-width:205px}.coordinates.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;gap:5px;margin:8px 0}.coordinates.svelte-1b6hqhz label.svelte-1b6hqhz{font-size:11px;min-width:0}.coordinates.svelte-1b6hqhz input.svelte-1b6hqhz{width:75px;max-width:100%;box-sizing:border-box}.point-name.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;justify-content:space-between;align-items:center;gap:5px}.point-name.svelte-1b6hqhz button.svelte-1b6hqhz{font-size:10px}.field-controls.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;gap:5px;align-items:center;margin-top:12px}.field-controls.svelte-1b6hqhz select.svelte-1b6hqhz{min-width:0;flex:1}.reading.svelte-1b6hqhz.svelte-1b6hqhz{background:#21384a;border-radius:10px;padding:12px;margin:12px 0}.reading.svelte-1b6hqhz>strong.svelte-1b6hqhz{display:block;font-size:28px}.reading.svelte-1b6hqhz strong small.svelte-1b6hqhz{display:inline;font-size:14px}.reading.svelte-1b6hqhz span.svelte-1b6hqhz{font-size:12px}dl.svelte-1b6hqhz.svelte-1b6hqhz{margin:10px 0}dl.svelte-1b6hqhz>div.svelte-1b6hqhz{display:flex;justify-content:space-between;gap:8px;margin:5px 0}dt.svelte-1b6hqhz.svelte-1b6hqhz{font-size:11px;color:#bbcad6}dd.svelte-1b6hqhz.svelte-1b6hqhz{margin:0;font-size:12px}.threshold.svelte-1b6hqhz.svelte-1b6hqhz{border:1px solid #42586b;border-radius:9px;padding:9px;margin-top:12px}.threshold.svelte-1b6hqhz label.svelte-1b6hqhz{font-size:11px;justify-content:space-between}.threshold.svelte-1b6hqhz input.svelte-1b6hqhz{width:60px}.threshold.svelte-1b6hqhz p.svelte-1b6hqhz{margin:6px 0;font-size:12px}.threshold.svelte-1b6hqhz .met.svelte-1b6hqhz{background:#6d441d;color:#fff0c5;padding:5px;border-radius:5px}.legend.svelte-1b6hqhz.svelte-1b6hqhz{display:grid;grid-template-columns:repeat(6,1fr);gap:2px;margin:14px 0 3px}.legend.svelte-1b6hqhz span.svelte-1b6hqhz{border-top:7px solid var(--color);padding-top:3px;font-size:10px}.error.svelte-1b6hqhz.svelte-1b6hqhz{background:#692f30;padding:9px;border-radius:7px;font-size:12px}.loading.svelte-1b6hqhz.svelte-1b6hqhz{font-size:12px;color:#ffd486}details.svelte-1b6hqhz.svelte-1b6hqhz{margin-top:12px}summary.svelte-1b6hqhz.svelte-1b6hqhz{cursor:pointer;font-size:12px}details.svelte-1b6hqhz p.svelte-1b6hqhz,.explain.svelte-1b6hqhz.svelte-1b6hqhz{font-size:11px;color:#bbcad6}a.svelte-1b6hqhz.svelte-1b6hqhz{color:#ffd486}.timeline.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;gap:5px;flex-wrap:wrap;max-height:160px;overflow:auto;margin-top:8px}.timeline.svelte-1b6hqhz button.svelte-1b6hqhz{font-size:10px}.series.svelte-1b6hqhz.svelte-1b6hqhz{max-height:220px;overflow:auto;margin-top:8px}table.svelte-1b6hqhz.svelte-1b6hqhz{width:100%;border-collapse:collapse;font-size:10px}td.svelte-1b6hqhz.svelte-1b6hqhz,th.svelte-1b6hqhz.svelte-1b6hqhz{padding:4px;border-bottom:1px solid #42586b;text-align:right}td.svelte-1b6hqhz.svelte-1b6hqhz:first-child,th.svelte-1b6hqhz.svelte-1b6hqhz:first-child{text-align:left}td.svelte-1b6hqhz button.svelte-1b6hqhz{font-size:10px}.resolution.svelte-1b6hqhz.svelte-1b6hqhz{margin-top:12px}.observation.svelte-1b6hqhz.svelte-1b6hqhz{background:#21384a;padding:9px;border-radius:8px}.opacity.svelte-1b6hqhz.svelte-1b6hqhz{justify-content:space-between;margin-top:9px}.opacity.svelte-1b6hqhz input.svelte-1b6hqhz{width:130px}footer.svelte-1b6hqhz.svelte-1b6hqhz{border-top:1px solid #42586b;margin-top:12px;padding-top:8px}footer.svelte-1b6hqhz small.svelte-1b6hqhz{font-size:10px;margin-top:6px}.contour-controls.svelte-1b6hqhz.svelte-1b6hqhz{border:1px solid #42586b;border-radius:9px;padding:9px;margin:10px 0}.contour-presets.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;gap:5px;margin:9px 0}.contour-presets.svelte-1b6hqhz button.svelte-1b6hqhz{font-size:10px}.contour-row.svelte-1b6hqhz.svelte-1b6hqhz{border-bottom:1px solid #42586b;padding:8px 0}.contour-check.svelte-1b6hqhz.svelte-1b6hqhz{font-size:11px;gap:6px}.contour-settings.svelte-1b6hqhz.svelte-1b6hqhz{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:6px}.contour-settings.svelte-1b6hqhz label.svelte-1b6hqhz{font-size:10px}.contour-settings.svelte-1b6hqhz select.svelte-1b6hqhz{font-size:10px;padding:4px}.contour-settings.svelte-1b6hqhz input[type=color].svelte-1b6hqhz{width:28px;height:26px;padding:2px;flex-shrink:0}.contour-time.svelte-1b6hqhz.svelte-1b6hqhz{margin:8px 0}.contour-controls.svelte-1b6hqhz>small.svelte-1b6hqhz{margin-top:7px}@media(max-width:600px){.panel.svelte-1b6hqhz.svelte-1b6hqhz{bottom:100px;width:285px;max-height:62dvh;padding:12px}.restore.svelte-1b6hqhz.svelte-1b6hqhz{bottom:100px}.coordinates.svelte-1b6hqhz input.svelte-1b6hqhz{width:65px}}");
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[125] = list[i];
	return child_ctx;
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[116] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[119] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[122] = list[i];
	child_ctx[124] = i;
	return child_ctx;
}

function get_each_context_4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[128] = list[i];
	return child_ctx;
}

function get_each_context_5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[128] = list[i];
	return child_ctx;
}

function get_each_context_6(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[133] = list[i];
	return child_ctx;
}

function get_each_context_7(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[136] = list[i];
	child_ctx[137] = list;
	child_ctx[138] = i;
	return child_ctx;
}

function get_each_context_8(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[139] = list[i];
	return child_ctx;
}

function get_each_context_9(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[142] = list[i];
	return child_ctx;
}

// (466:0) {:else}
function create_else_block(ctx) {
	let section;
	let header;
	let div0;
	let button0;
	let t3;
	let nav;
	let button1;
	let button2;
	let label0;
	let input0;
	let t6;
	let t7;
	let details0;
	let summary0;
	let t9;
	let div1;
	let button3;
	let t10;
	let button3_disabled_value;
	let button4;
	let t12;
	let t13;
	let label1;
	let input1;
	let t14;
	let t15;
	let t16;
	let t17;
	let t18;
	let small1;
	let t20;
	let small2;
	let t22;
	let label2;
	let t23;
	let select;
	let show_if = ![.../*places*/ ctx[34], .../*saved*/ ctx[23]].some(/*func*/ ctx[59]);
	let if_block2_anchor;
	let each2_anchor;
	let select_disabled_value;
	let t24;
	let small3;
	let t26;
	let div2;
	let label3;
	let t27;
	let input2;
	let label4;
	let t28;
	let input3;
	let button5;
	let t29;
	let button5_disabled_value;
	let t30;
	let t31;
	let div3;
	let small4;
	let t32_value = /*selected*/ ctx[6].lat.toFixed(3) + "";
	let t32;
	let t33;
	let t34_value = /*selected*/ ctx[6].lon.toFixed(3) + "";
	let t34;
	let t35;
	let button6;

	let t36_value = (/*saved*/ ctx[23].some(/*func_2*/ ctx[75])
	? 'Unsave'
	: 'Save place') + "";

	let t36;
	let button6_disabled_value;
	let t37;
	let t38;
	let details1;
	let summary1;
	let t40;
	let label5;
	let t41;
	let input4;
	let t42;
	let p0;
	let t44;
	let p1;
	let t46;
	let p2;
	let t48;
	let footer;
	let button7;
	let t49;
	let button7_disabled_value;
	let t50;
	let mounted;
	let dispose;
	let each_value_7 = ensure_array_like(Object.keys(CONTOUR_FIELDS));
	let each_blocks_3 = [];

	for (let i = 0; i < each_value_7.length; i += 1) {
		each_blocks_3[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
	}

	let if_block0 = /*contourStatus*/ ctx[24].loading && create_if_block_21();
	let each_value_6 = ensure_array_like(/*contourStatus*/ ctx[24].errors);
	let each_blocks_2 = [];

	for (let i = 0; i < each_value_6.length; i += 1) {
		each_blocks_2[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
	}

	let if_block1 = /*contourStatus*/ ctx[24].validTime && /*contourStatus*/ ctx[24].active.length && create_if_block_20(ctx);
	let if_block2 = show_if && create_if_block_19(ctx);
	let each_value_5 = ensure_array_like(/*places*/ ctx[34]);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_5.length; i += 1) {
		each_blocks_1[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
	}

	let each_value_4 = ensure_array_like(/*saved*/ ctx[23].filter(/*func_1*/ ctx[70]));
	let each_blocks = [];

	for (let i = 0; i < each_value_4.length; i += 1) {
		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
	}

	let if_block3 = /*locationError*/ ctx[20] && create_if_block_18(ctx);

	function select_block_type_2(ctx, dirty) {
		if (/*view*/ ctx[3] === 'forecast') return create_if_block_2;
		return create_else_block_3;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block4 = current_block_type(ctx);
	let if_block5 = /*forecast*/ ctx[0] && create_if_block_1(ctx);

	return {
		c() {
			section = element("section");
			header = element("header");
			div0 = element("div");
			div0.innerHTML = `<strong class="svelte-1b6hqhz">Synoptic Atlas</strong><small class="svelte-1b6hqhz">NASA GEOS-FP · v1.1.0</small>`;
			button0 = element("button");
			button0.textContent = "−";
			t3 = space();
			nav = element("nav");
			button1 = element("button");
			button1.textContent = "Forecast";
			button2 = element("button");
			button2.textContent = "Satellite";
			label0 = element("label");
			input0 = element("input");
			t6 = text("On");
			t7 = space();
			details0 = element("details");
			summary0 = element("summary");
			summary0.textContent = "Weather isolines";
			t9 = space();
			div1 = element("div");
			button3 = element("button");
			t10 = text("Synoptic preset");
			button4 = element("button");
			button4.textContent = "Clear contours";
			t12 = space();

			for (let i = 0; i < each_blocks_3.length; i += 1) {
				each_blocks_3[i].c();
			}

			t13 = space();
			label1 = element("label");
			input1 = element("input");
			t14 = text("Show labels with levels and units");
			t15 = space();
			if (if_block0) if_block0.c();
			t16 = space();

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].c();
			}

			t17 = space();
			if (if_block1) if_block1.c();
			t18 = space();
			small1 = element("small");
			small1.textContent = "Independent layers, shown together. GEOS-FP on a sampled 1.25-degree contour grid; upper-air values below terrain are masked. Height labels use dam (1 dam = 10 m), temperature uses Celsius, MSLP uses hPa.";
			t20 = space();
			small2 = element("small");
			small2.textContent = "Contours follow the nearest 3-hour snapshot within 90 minutes of Windy's forecast time. Dust is a 3-hour mean; satellite observation time is independent.";
			t22 = space();
			label2 = element("label");
			t23 = text("Place");
			select = element("select");
			if (if_block2) if_block2.c();
			if_block2_anchor = empty();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			each2_anchor = empty();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t24 = space();
			small3 = element("small");
			small3.textContent = "Click the map or enter signed coordinates.";
			t26 = space();
			div2 = element("div");
			label3 = element("label");
			t27 = text("Lat");
			input2 = element("input");
			label4 = element("label");
			t28 = text("Lon");
			input3 = element("input");
			button5 = element("button");
			t29 = text("Go");
			t30 = space();
			if (if_block3) if_block3.c();
			t31 = space();
			div3 = element("div");
			small4 = element("small");
			t32 = text(t32_value);
			t33 = text("°, ");
			t34 = text(t34_value);
			t35 = text("°");
			button6 = element("button");
			t36 = text(t36_value);
			t37 = space();
			if_block4.c();
			t38 = space();
			details1 = element("details");
			summary1 = element("summary");
			summary1.textContent = "Display and interpretation";
			t40 = space();
			label5 = element("label");
			t41 = text("Map opacity");
			input4 = element("input");
			t42 = space();
			p0 = element("p");
			p0.textContent = "GEOS-FP is a forecast, not a surface observation. Native grid points are retained worldwide; small features between them may be unresolved. Values use compact 16-bit logarithmic packing for delivery, with small quantization differences. Points use the nearest source node.";
			t44 = space();
			p1 = element("p");
			p1.textContent = "Surface dust is modelled mineral dust, not total PM₁₀. Fine dust is only the dust contribution to PM₂.₅. Optical depth describes the full atmospheric column and is not a visibility estimate. Threshold guidance applies to the selected point and forecast period only. There are no background notifications.";
			t46 = space();
			p2 = element("p");
			p2.textContent = "Use surface observations and official warnings for decisions. Forecast accuracy and alert thresholds have not been independently validated.";
			t48 = space();
			footer = element("footer");
			button7 = element("button");
			t49 = text("Refresh");
			t50 = space();
			if (if_block5) if_block5.c();
			attr(button0, "aria-label", "Minimize panel");
			attr(button0, "class", "svelte-1b6hqhz");
			attr(header, "class", "svelte-1b6hqhz");
			attr(button1, "class", "svelte-1b6hqhz");
			toggle_class(button1, "active", /*view*/ ctx[3] === 'forecast');
			attr(button2, "class", "svelte-1b6hqhz");
			toggle_class(button2, "active", /*view*/ ctx[3] === 'satellite');
			attr(input0, "aria-label", "Enable plugin");
			attr(input0, "type", "checkbox");
			attr(input0, "class", "svelte-1b6hqhz");
			attr(label0, "class", "svelte-1b6hqhz");
			attr(nav, "aria-label", "Dust view");
			attr(nav, "class", "svelte-1b6hqhz");
			attr(summary0, "class", "svelte-1b6hqhz");
			button3.disabled = button3_disabled_value = !/*enabled*/ ctx[1];
			attr(button3, "class", "svelte-1b6hqhz");
			attr(button4, "class", "svelte-1b6hqhz");
			attr(div1, "class", "contour-presets svelte-1b6hqhz");
			attr(input1, "aria-label", "Contour labels");
			attr(input1, "type", "checkbox");
			attr(input1, "class", "svelte-1b6hqhz");
			attr(label1, "class", "contour-check svelte-1b6hqhz");
			attr(small1, "class", "svelte-1b6hqhz");
			attr(small2, "class", "svelte-1b6hqhz");
			attr(details0, "class", "contour-controls svelte-1b6hqhz");
			attr(select, "aria-label", "Location");
			select.disabled = select_disabled_value = !/*enabled*/ ctx[1];
			attr(select, "class", "svelte-1b6hqhz");
			if (/*selected*/ ctx[6].name === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[71].call(select));
			attr(label2, "class", "place svelte-1b6hqhz");
			attr(small3, "class", "svelte-1b6hqhz");
			attr(input2, "aria-label", "Latitude");
			attr(input2, "type", "number");
			attr(input2, "min", "-90");
			attr(input2, "max", "90");
			attr(input2, "step", "any");
			attr(input2, "class", "svelte-1b6hqhz");
			attr(label3, "class", "svelte-1b6hqhz");
			attr(input3, "aria-label", "Longitude");
			attr(input3, "type", "number");
			attr(input3, "step", "any");
			attr(input3, "class", "svelte-1b6hqhz");
			attr(label4, "class", "svelte-1b6hqhz");
			button5.disabled = button5_disabled_value = !/*enabled*/ ctx[1];
			attr(button5, "class", "svelte-1b6hqhz");
			attr(div2, "class", "coordinates svelte-1b6hqhz");
			attr(small4, "class", "svelte-1b6hqhz");
			button6.disabled = button6_disabled_value = !/*enabled*/ ctx[1];
			attr(button6, "class", "svelte-1b6hqhz");
			attr(div3, "class", "point-name svelte-1b6hqhz");
			attr(summary1, "class", "svelte-1b6hqhz");
			attr(input4, "aria-label", "Map opacity");
			attr(input4, "type", "range");
			attr(input4, "min", ".15");
			attr(input4, "max", "1");
			attr(input4, "step", ".05");
			attr(input4, "class", "svelte-1b6hqhz");
			attr(label5, "class", "opacity svelte-1b6hqhz");
			attr(p0, "class", "svelte-1b6hqhz");
			attr(p1, "class", "svelte-1b6hqhz");
			attr(p2, "class", "svelte-1b6hqhz");
			attr(details1, "class", "svelte-1b6hqhz");
			button7.disabled = button7_disabled_value = !/*enabled*/ ctx[1] || /*loading*/ ctx[16] || /*satMetaLoading*/ ctx[30] || /*satLoading*/ ctx[29];
			attr(button7, "class", "svelte-1b6hqhz");
			attr(footer, "class", "svelte-1b6hqhz");
			attr(section, "class", "panel svelte-1b6hqhz");
			attr(section, "aria-label", "Synoptic Atlas");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, header);
			append(header, div0);
			append(header, button0);
			append(section, t3);
			append(section, nav);
			append(nav, button1);
			append(nav, button2);
			append(nav, label0);
			append(label0, input0);
			input0.checked = /*enabled*/ ctx[1];
			append(label0, t6);
			append(section, t7);
			append(section, details0);
			append(details0, summary0);
			append(details0, t9);
			append(details0, div1);
			append(div1, button3);
			append(button3, t10);
			append(div1, button4);
			append(details0, t12);

			for (let i = 0; i < each_blocks_3.length; i += 1) {
				if (each_blocks_3[i]) {
					each_blocks_3[i].m(details0, null);
				}
			}

			append(details0, t13);
			append(details0, label1);
			append(label1, input1);
			input1.checked = /*contourOptions*/ ctx[8].labels;
			append(label1, t14);
			append(details0, t15);
			if (if_block0) if_block0.m(details0, null);
			append(details0, t16);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				if (each_blocks_2[i]) {
					each_blocks_2[i].m(details0, null);
				}
			}

			append(details0, t17);
			if (if_block1) if_block1.m(details0, null);
			append(details0, t18);
			append(details0, small1);
			append(details0, t20);
			append(details0, small2);
			append(section, t22);
			append(section, label2);
			append(label2, t23);
			append(label2, select);
			if (if_block2) if_block2.m(select, null);
			append(select, if_block2_anchor);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				if (each_blocks_1[i]) {
					each_blocks_1[i].m(select, null);
				}
			}

			append(select, each2_anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*selected*/ ctx[6].name, true);
			append(section, t24);
			append(section, small3);
			append(section, t26);
			append(section, div2);
			append(div2, label3);
			append(label3, t27);
			append(label3, input2);
			set_input_value(input2, /*inputLat*/ ctx[21]);
			append(div2, label4);
			append(label4, t28);
			append(label4, input3);
			set_input_value(input3, /*inputLon*/ ctx[22]);
			append(div2, button5);
			append(button5, t29);
			append(section, t30);
			if (if_block3) if_block3.m(section, null);
			append(section, t31);
			append(section, div3);
			append(div3, small4);
			append(small4, t32);
			append(small4, t33);
			append(small4, t34);
			append(small4, t35);
			append(div3, button6);
			append(button6, t36);
			append(section, t37);
			if_block4.m(section, null);
			append(section, t38);
			append(section, details1);
			append(details1, summary1);
			append(details1, t40);
			append(details1, label5);
			append(label5, t41);
			append(label5, input4);
			set_input_value(input4, /*opacity*/ ctx[5]);
			append(details1, t42);
			append(details1, p0);
			append(details1, t44);
			append(details1, p1);
			append(details1, t46);
			append(details1, p2);
			append(section, t48);
			append(section, footer);
			append(footer, button7);
			append(button7, t49);
			append(footer, t50);
			if (if_block5) if_block5.m(footer, null);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler_1*/ ctx[61]),
					listen(button1, "click", /*click_handler_2*/ ctx[62]),
					listen(button2, "click", /*click_handler_3*/ ctx[63]),
					listen(input0, "change", /*input0_change_handler*/ ctx[64]),
					listen(input0, "change", /*toggleEnabled*/ ctx[49]),
					listen(button3, "click", /*synopticPreset*/ ctx[39]),
					listen(button4, "click", /*clearContours*/ ctx[40]),
					listen(input1, "change", /*input1_change_handler*/ ctx[69]),
					listen(input1, "change", /*savePreferences*/ ctx[37]),
					listen(select, "change", /*select_change_handler_2*/ ctx[71]),
					listen(select, "change", /*change_handler*/ ctx[72]),
					listen(input2, "input", /*input2_input_handler*/ ctx[73]),
					listen(input3, "input", /*input3_input_handler*/ ctx[74]),
					listen(button5, "click", /*goToCoordinates*/ ctx[44]),
					listen(button6, "click", /*savePlace*/ ctx[38]),
					listen(input4, "change", /*input4_change_input_handler*/ ctx[85]),
					listen(input4, "input", /*input4_change_input_handler*/ ctx[85]),
					listen(input4, "change", /*savePreferences*/ ctx[37]),
					listen(button7, "click", /*refreshAll*/ ctx[41])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*view*/ 8) {
				toggle_class(button1, "active", /*view*/ ctx[3] === 'forecast');
			}

			if (dirty[0] & /*view*/ 8) {
				toggle_class(button2, "active", /*view*/ ctx[3] === 'satellite');
			}

			if (dirty[0] & /*enabled*/ 2) {
				input0.checked = /*enabled*/ ctx[1];
			}

			if (dirty[0] & /*enabled*/ 2 && button3_disabled_value !== (button3_disabled_value = !/*enabled*/ ctx[1])) {
				button3.disabled = button3_disabled_value;
			}

			if (dirty[0] & /*enabled, contourOptions*/ 258 | dirty[1] & /*savePreferences*/ 64) {
				each_value_7 = ensure_array_like(Object.keys(CONTOUR_FIELDS));
				let i;

				for (i = 0; i < each_value_7.length; i += 1) {
					const child_ctx = get_each_context_7(ctx, each_value_7, i);

					if (each_blocks_3[i]) {
						each_blocks_3[i].p(child_ctx, dirty);
					} else {
						each_blocks_3[i] = create_each_block_7(child_ctx);
						each_blocks_3[i].c();
						each_blocks_3[i].m(details0, t13);
					}
				}

				for (; i < each_blocks_3.length; i += 1) {
					each_blocks_3[i].d(1);
				}

				each_blocks_3.length = each_value_7.length;
			}

			if (dirty[0] & /*contourOptions*/ 256) {
				input1.checked = /*contourOptions*/ ctx[8].labels;
			}

			if (/*contourStatus*/ ctx[24].loading) {
				if (if_block0) ; else {
					if_block0 = create_if_block_21();
					if_block0.c();
					if_block0.m(details0, t16);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*contourStatus*/ 16777216) {
				each_value_6 = ensure_array_like(/*contourStatus*/ ctx[24].errors);
				let i;

				for (i = 0; i < each_value_6.length; i += 1) {
					const child_ctx = get_each_context_6(ctx, each_value_6, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(child_ctx, dirty);
					} else {
						each_blocks_2[i] = create_each_block_6(child_ctx);
						each_blocks_2[i].c();
						each_blocks_2[i].m(details0, t17);
					}
				}

				for (; i < each_blocks_2.length; i += 1) {
					each_blocks_2[i].d(1);
				}

				each_blocks_2.length = each_value_6.length;
			}

			if (/*contourStatus*/ ctx[24].validTime && /*contourStatus*/ ctx[24].active.length) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_20(ctx);
					if_block1.c();
					if_block1.m(details0, t18);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*saved, selected*/ 8388672) show_if = ![.../*places*/ ctx[34], .../*saved*/ ctx[23]].some(/*func*/ ctx[59]);

			if (show_if) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_19(ctx);
					if_block2.c();
					if_block2.m(select, if_block2_anchor);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[1] & /*places*/ 8) {
				each_value_5 = ensure_array_like(/*places*/ ctx[34]);
				let i;

				for (i = 0; i < each_value_5.length; i += 1) {
					const child_ctx = get_each_context_5(ctx, each_value_5, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_5(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(select, each2_anchor);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_5.length;
			}

			if (dirty[0] & /*saved*/ 8388608 | dirty[1] & /*places*/ 8) {
				each_value_4 = ensure_array_like(/*saved*/ ctx[23].filter(/*func_1*/ ctx[70]));
				let i;

				for (i = 0; i < each_value_4.length; i += 1) {
					const child_ctx = get_each_context_4(ctx, each_value_4, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_4(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_4.length;
			}

			if (dirty[0] & /*enabled*/ 2 && select_disabled_value !== (select_disabled_value = !/*enabled*/ ctx[1])) {
				select.disabled = select_disabled_value;
			}

			if (dirty[0] & /*selected, saved*/ 8388672 | dirty[1] & /*places*/ 8) {
				select_option(select, /*selected*/ ctx[6].name);
			}

			if (dirty[0] & /*inputLat*/ 2097152 && to_number(input2.value) !== /*inputLat*/ ctx[21]) {
				set_input_value(input2, /*inputLat*/ ctx[21]);
			}

			if (dirty[0] & /*inputLon*/ 4194304 && to_number(input3.value) !== /*inputLon*/ ctx[22]) {
				set_input_value(input3, /*inputLon*/ ctx[22]);
			}

			if (dirty[0] & /*enabled*/ 2 && button5_disabled_value !== (button5_disabled_value = !/*enabled*/ ctx[1])) {
				button5.disabled = button5_disabled_value;
			}

			if (/*locationError*/ ctx[20]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_18(ctx);
					if_block3.c();
					if_block3.m(section, t31);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (dirty[0] & /*selected*/ 64 && t32_value !== (t32_value = /*selected*/ ctx[6].lat.toFixed(3) + "")) set_data(t32, t32_value);
			if (dirty[0] & /*selected*/ 64 && t34_value !== (t34_value = /*selected*/ ctx[6].lon.toFixed(3) + "")) set_data(t34, t34_value);

			if (dirty[0] & /*saved, selected*/ 8388672 && t36_value !== (t36_value = (/*saved*/ ctx[23].some(/*func_2*/ ctx[75])
			? 'Unsave'
			: 'Save place') + "")) set_data(t36, t36_value);

			if (dirty[0] & /*enabled*/ 2 && button6_disabled_value !== (button6_disabled_value = !/*enabled*/ ctx[1])) {
				button6.disabled = button6_disabled_value;
			}

			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block4) {
				if_block4.p(ctx, dirty);
			} else {
				if_block4.d(1);
				if_block4 = current_block_type(ctx);

				if (if_block4) {
					if_block4.c();
					if_block4.m(section, t38);
				}
			}

			if (dirty[0] & /*opacity*/ 32) {
				set_input_value(input4, /*opacity*/ ctx[5]);
			}

			if (dirty[0] & /*enabled, loading, satMetaLoading, satLoading*/ 1610678274 && button7_disabled_value !== (button7_disabled_value = !/*enabled*/ ctx[1] || /*loading*/ ctx[16] || /*satMetaLoading*/ ctx[30] || /*satLoading*/ ctx[29])) {
				button7.disabled = button7_disabled_value;
			}

			if (/*forecast*/ ctx[0]) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block_1(ctx);
					if_block5.c();
					if_block5.m(footer, null);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(section);
			}

			destroy_each(each_blocks_3, detaching);
			if (if_block0) if_block0.d();
			destroy_each(each_blocks_2, detaching);
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			destroy_each(each_blocks_1, detaching);
			destroy_each(each_blocks, detaching);
			if (if_block3) if_block3.d();
			if_block4.d();
			if (if_block5) if_block5.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (464:0) {#if hidden}
function create_if_block(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "🌫 Synoptic Atlas";
			attr(button, "class", "restore svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[60]);
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

// (478:21) {:else}
function create_else_block_4(ctx) {
	let small;

	return {
		c() {
			small = element("small");
			small.textContent = "Mean sea level";
			attr(small, "class", "svelte-1b6hqhz");
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

// (476:12) {#if key !== 'mslp'}
function create_if_block_22(ctx) {
	let select;
	let select_disabled_value;
	let mounted;
	let dispose;
	let each_value_9 = ensure_array_like(PRESSURE_LEVELS);
	let each_blocks = [];

	for (let i = 0; i < each_value_9.length; i += 1) {
		each_blocks[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
	}

	function select_change_handler() {
		/*select_change_handler*/ ctx[66].call(select, /*key*/ ctx[136]);
	}

	return {
		c() {
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(select, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[136]].label + ' pressure level');
			select.disabled = select_disabled_value = !/*enabled*/ ctx[1];
			attr(select, "class", "svelte-1b6hqhz");
			if (/*contourOptions*/ ctx[8][/*key*/ ctx[136]].level === void 0) add_render_callback(select_change_handler);
		},
		m(target, anchor) {
			insert(target, select, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*contourOptions*/ ctx[8][/*key*/ ctx[136]].level, true);

			if (!mounted) {
				dispose = [
					listen(select, "change", select_change_handler),
					listen(select, "change", /*savePreferences*/ ctx[37])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*enabled*/ 2 && select_disabled_value !== (select_disabled_value = !/*enabled*/ ctx[1])) {
				select.disabled = select_disabled_value;
			}

			if (dirty[0] & /*contourOptions*/ 256) {
				select_option(select, /*contourOptions*/ ctx[8][/*key*/ ctx[136]].level);
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

// (477:14) {#each PRESSURE_LEVELS as level}
function create_each_block_9(ctx) {
	let option;

	return {
		c() {
			option = element("option");
			option.textContent = `${/*level*/ ctx[142]} hPa`;
			option.__value = /*level*/ ctx[142];
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

// (479:178) {#each CONTOUR_FIELDS[key].steps as step}
function create_each_block_8(ctx) {
	let option;
	let t0_value = /*step*/ ctx[139] + "";
	let t0;
	let t1;

	let t2_value = (/*key*/ ctx[136] === 'temp'
	? 'C'
	: CONTOUR_FIELDS[/*key*/ ctx[136]].units) + "";

	let t2;

	return {
		c() {
			option = element("option");
			t0 = text(t0_value);
			t1 = space();
			t2 = text(t2_value);
			option.__value = /*step*/ ctx[139];
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

// (472:6) {#each Object.keys(CONTOUR_FIELDS) as key}
function create_each_block_7(ctx) {
	let div1;
	let label0;
	let input0;
	let input0_disabled_value;
	let span;
	let t0_value = CONTOUR_FIELDS[/*key*/ ctx[136]].label + "";
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
		/*input0_change_handler_1*/ ctx[65].call(input0, /*key*/ ctx[136]);
	}

	function select_block_type_1(ctx, dirty) {
		if (/*key*/ ctx[136] !== 'mslp') return create_if_block_22;
		return create_else_block_4;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);
	let each_value_8 = ensure_array_like(CONTOUR_FIELDS[/*key*/ ctx[136]].steps);
	let each_blocks = [];

	for (let i = 0; i < each_value_8.length; i += 1) {
		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
	}

	function select_change_handler_1() {
		/*select_change_handler_1*/ ctx[67].call(select, /*key*/ ctx[136]);
	}

	function input1_input_handler() {
		/*input1_input_handler*/ ctx[68].call(input1, /*key*/ ctx[136]);
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
			attr(input0, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[136]].label + ' isolines');
			attr(input0, "type", "checkbox");
			input0.disabled = input0_disabled_value = !/*enabled*/ ctx[1];
			attr(input0, "class", "svelte-1b6hqhz");
			attr(span, "style", span_style_value = 'color:' + /*contourOptions*/ ctx[8][/*key*/ ctx[136]].color);
			attr(label0, "class", "contour-check svelte-1b6hqhz");
			attr(select, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[136]].label + ' contour spacing');
			select.disabled = select_disabled_value = !/*enabled*/ ctx[1];
			attr(select, "class", "svelte-1b6hqhz");
			if (/*contourOptions*/ ctx[8][/*key*/ ctx[136]].step === void 0) add_render_callback(select_change_handler_1);
			attr(label1, "class", "svelte-1b6hqhz");
			attr(input1, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[136]].label + ' contour color');
			attr(input1, "type", "color");
			input1.disabled = input1_disabled_value = !/*enabled*/ ctx[1];
			attr(input1, "class", "svelte-1b6hqhz");
			attr(div0, "class", "contour-settings svelte-1b6hqhz");
			attr(div1, "class", "contour-row svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, label0);
			append(label0, input0);
			input0.checked = /*contourOptions*/ ctx[8][/*key*/ ctx[136]].on;
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

			select_option(select, /*contourOptions*/ ctx[8][/*key*/ ctx[136]].step, true);
			append(div0, t4);
			append(div0, input1);
			set_input_value(input1, /*contourOptions*/ ctx[8][/*key*/ ctx[136]].color);

			if (!mounted) {
				dispose = [
					listen(input0, "change", input0_change_handler_1),
					listen(input0, "change", /*savePreferences*/ ctx[37]),
					listen(select, "change", select_change_handler_1),
					listen(select, "change", /*savePreferences*/ ctx[37]),
					listen(input1, "input", input1_input_handler),
					listen(input1, "change", /*savePreferences*/ ctx[37])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*enabled*/ 2 && input0_disabled_value !== (input0_disabled_value = !/*enabled*/ ctx[1])) {
				input0.disabled = input0_disabled_value;
			}

			if (dirty[0] & /*contourOptions*/ 256) {
				input0.checked = /*contourOptions*/ ctx[8][/*key*/ ctx[136]].on;
			}

			if (dirty[0] & /*contourOptions*/ 256 && span_style_value !== (span_style_value = 'color:' + /*contourOptions*/ ctx[8][/*key*/ ctx[136]].color)) {
				attr(span, "style", span_style_value);
			}

			if_block.p(ctx, dirty);

			if (dirty & /*Object*/ 0) {
				each_value_8 = ensure_array_like(CONTOUR_FIELDS[/*key*/ ctx[136]].steps);
				let i;

				for (i = 0; i < each_value_8.length; i += 1) {
					const child_ctx = get_each_context_8(ctx, each_value_8, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_8(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_8.length;
			}

			if (dirty[0] & /*enabled*/ 2 && select_disabled_value !== (select_disabled_value = !/*enabled*/ ctx[1])) {
				select.disabled = select_disabled_value;
			}

			if (dirty[0] & /*contourOptions*/ 256) {
				select_option(select, /*contourOptions*/ ctx[8][/*key*/ ctx[136]].step);
			}

			if (dirty[0] & /*enabled*/ 2 && input1_disabled_value !== (input1_disabled_value = !/*enabled*/ ctx[1])) {
				input1.disabled = input1_disabled_value;
			}

			if (dirty[0] & /*contourOptions*/ 256) {
				set_input_value(input1, /*contourOptions*/ ctx[8][/*key*/ ctx[136]].color);
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

// (485:6) {#if contourStatus.loading}
function create_if_block_21(ctx) {
	let p_1;

	return {
		c() {
			p_1 = element("p");
			p_1.textContent = "Loading GEOS weather isolines.";
			attr(p_1, "class", "loading svelte-1b6hqhz");
			attr(p_1, "role", "status");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (486:6) {#each contourStatus.errors as message}
function create_each_block_6(ctx) {
	let p_1;
	let t_value = /*message*/ ctx[133] + "";
	let t;

	return {
		c() {
			p_1 = element("p");
			t = text(t_value);
			attr(p_1, "class", "error svelte-1b6hqhz");
			attr(p_1, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
			append(p_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*contourStatus*/ 16777216 && t_value !== (t_value = /*message*/ ctx[133] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (487:6) {#if contourStatus.validTime && contourStatus.active.length}
function create_if_block_20(ctx) {
	let small;
	let t0;
	let t1_value = /*displayTime*/ ctx[35](/*contourStatus*/ ctx[24].validTime) + "";
	let t1;
	let t2;
	let br;
	let t3;
	let t4_value = new Date(/*contourStatus*/ ctx[24].runTime).toISOString().slice(0, 16).replace('T', ' ') + "";
	let t4;
	let t5;

	return {
		c() {
			small = element("small");
			t0 = text("Contours valid ");
			t1 = text(t1_value);
			t2 = text("; instantaneous snapshot.");
			br = element("br");
			t3 = text("GEOS run ");
			t4 = text(t4_value);
			t5 = text(" UTC.");
			attr(small, "class", "contour-time svelte-1b6hqhz");
			attr(small, "data-testid", "contour-time");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t0);
			append(small, t1);
			append(small, t2);
			append(small, br);
			append(small, t3);
			append(small, t4);
			append(small, t5);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*contourStatus*/ 16777216 && t1_value !== (t1_value = /*displayTime*/ ctx[35](/*contourStatus*/ ctx[24].validTime) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*contourStatus*/ 16777216 && t4_value !== (t4_value = new Date(/*contourStatus*/ ctx[24].runTime).toISOString().slice(0, 16).replace('T', ' ') + "")) set_data(t4, t4_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (494:6) {#if ![...places, ...saved].some(p => p.name === selected.name)}
function create_if_block_19(ctx) {
	let option;
	let t_value = /*selected*/ ctx[6].name + "";
	let t;
	let option_value_value;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*selected*/ ctx[6].name;
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selected*/ 64 && t_value !== (t_value = /*selected*/ ctx[6].name + "")) set_data(t, t_value);

			if (dirty[0] & /*selected, saved*/ 8388672 | dirty[1] & /*places*/ 8 && option_value_value !== (option_value_value = /*selected*/ ctx[6].name)) {
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

// (495:6) {#each places as p}
function create_each_block_5(ctx) {
	let option;
	let t_value = /*p*/ ctx[128].name + "";
	let t;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = /*p*/ ctx[128].name;
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

// (496:6) {#each saved.filter(p => !places.some(v => v.name === p.name)) as p}
function create_each_block_4(ctx) {
	let option;
	let t_value = /*p*/ ctx[128].name + "";
	let t;
	let option_value_value;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*p*/ ctx[128].name;
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*saved*/ 8388608 && t_value !== (t_value = /*p*/ ctx[128].name + "")) set_data(t, t_value);

			if (dirty[0] & /*saved*/ 8388608 && option_value_value !== (option_value_value = /*p*/ ctx[128].name)) {
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

// (500:4) {#if locationError}
function create_if_block_18(ctx) {
	let p_1;
	let t;

	return {
		c() {
			p_1 = element("p");
			t = text(/*locationError*/ ctx[20]);
			attr(p_1, "class", "error svelte-1b6hqhz");
			attr(p_1, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
			append(p_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*locationError*/ 1048576) set_data(t, /*locationError*/ ctx[20]);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (523:4) {:else}
function create_else_block_3(ctx) {
	let label0;
	let t0;
	let select0;
	let option0;
	let option1;
	let t3;
	let label1;
	let t4;
	let select1;
	let show_if = /*satTime*/ ctx[10] && !/*satMeta*/ ctx[11]?.times.includes(/*satTime*/ ctx[10]);
	let if_block0_anchor;
	let select1_disabled_value;
	let t5;
	let button;
	let t6;
	let button_disabled_value;
	let t7;
	let t8;
	let t9;
	let t10;
	let t11;
	let p0;

	let t12_value = (/*satSource*/ ctx[9] === 'global'
	? 'Three-hour dust RGB composite from several geostationary satellites.'
	: 'Ten-minute Meteosat Dust RGB for Europe, Africa and the Middle East.') + "";

	let t12;
	let t13;
	let t14;
	let p1;
	let t16;
	let small;
	let mounted;
	let dispose;
	let if_block0 = show_if && create_if_block_17(ctx);
	let each_value_3 = ensure_array_like(/*satMeta*/ ctx[11]?.times || []);
	let each_blocks = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	let if_block1 = /*satError*/ ctx[28] && create_if_block_16(ctx);
	let if_block2 = (/*satMetaLoading*/ ctx[30] || /*satLoading*/ ctx[29]) && create_if_block_15();
	let if_block3 = /*satTime*/ ctx[10] && create_if_block_14(ctx);
	let if_block4 = /*satDelayed*/ ctx[32] && create_if_block_13();

	return {
		c() {
			label0 = element("label");
			t0 = text("Source");
			select0 = element("select");
			option0 = element("option");
			option0.textContent = "Global dust composite";
			option1 = element("option");
			option1.textContent = "Meteosat Dust RGB";
			t3 = space();
			label1 = element("label");
			t4 = text("Observed");
			select1 = element("select");
			if (if_block0) if_block0.c();
			if_block0_anchor = empty();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t5 = space();
			button = element("button");
			t6 = text("Latest observation");
			t7 = space();
			if (if_block1) if_block1.c();
			t8 = space();
			if (if_block2) if_block2.c();
			t9 = space();
			if (if_block3) if_block3.c();
			t10 = space();
			if (if_block4) if_block4.c();
			t11 = space();
			p0 = element("p");
			t12 = text(t12_value);
			t13 = text(" Satellite coverage varies; blank areas can mean no observation.");
			t14 = space();
			p1 = element("p");
			p1.textContent = "Satellite time is independent of Windy’s forecast timeline. RGB imagery supports visual dust tracking; it does not measure surface dust concentration.";
			t16 = space();
			small = element("small");
			small.innerHTML = `Imagery: <a href="https://view.eumetsat.int/" target="_blank" rel="noopener noreferrer" class="svelte-1b6hqhz">EUMETSAT EUMETView</a> · <a href="https://user.eumetsat.int/resources/user-guides/dust-clouds" target="_blank" rel="noopener noreferrer" class="svelte-1b6hqhz">Interpretation guide</a>`;
			option0.__value = "global";
			set_input_value(option0, option0.__value);
			option1.__value = "meteosat";
			set_input_value(option1, option1.__value);
			attr(select0, "aria-label", "Satellite source");
			attr(select0, "class", "svelte-1b6hqhz");
			if (/*satSource*/ ctx[9] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[81].call(select0));
			attr(label0, "class", "place svelte-1b6hqhz");
			attr(select1, "aria-label", "Observation time");
			select1.disabled = select1_disabled_value = !/*satMeta*/ ctx[11];
			attr(select1, "class", "svelte-1b6hqhz");
			if (/*satTime*/ ctx[10] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[82].call(select1));
			attr(label1, "class", "place svelte-1b6hqhz");
			button.disabled = button_disabled_value = !/*satMeta*/ ctx[11];
			attr(button, "class", "svelte-1b6hqhz");
			attr(p0, "class", "explain svelte-1b6hqhz");
			attr(p1, "class", "explain svelte-1b6hqhz");
			attr(small, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, label0, anchor);
			append(label0, t0);
			append(label0, select0);
			append(select0, option0);
			append(select0, option1);
			select_option(select0, /*satSource*/ ctx[9], true);
			insert(target, t3, anchor);
			insert(target, label1, anchor);
			append(label1, t4);
			append(label1, select1);
			if (if_block0) if_block0.m(select1, null);
			append(select1, if_block0_anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select1, null);
				}
			}

			select_option(select1, /*satTime*/ ctx[10], true);
			insert(target, t5, anchor);
			insert(target, button, anchor);
			append(button, t6);
			insert(target, t7, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, t8, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert(target, t9, anchor);
			if (if_block3) if_block3.m(target, anchor);
			insert(target, t10, anchor);
			if (if_block4) if_block4.m(target, anchor);
			insert(target, t11, anchor);
			insert(target, p0, anchor);
			append(p0, t12);
			append(p0, t13);
			insert(target, t14, anchor);
			insert(target, p1, anchor);
			insert(target, t16, anchor);
			insert(target, small, anchor);

			if (!mounted) {
				dispose = [
					listen(select0, "change", /*select0_change_handler*/ ctx[81]),
					listen(select0, "change", /*changeSatellite*/ ctx[47]),
					listen(select1, "change", /*select1_change_handler*/ ctx[82]),
					listen(select1, "change", /*change_handler_1*/ ctx[83]),
					listen(button, "click", /*click_handler_6*/ ctx[84])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*satSource*/ 512) {
				select_option(select0, /*satSource*/ ctx[9]);
			}

			if (dirty[0] & /*satTime, satMeta*/ 3072) show_if = /*satTime*/ ctx[10] && !/*satMeta*/ ctx[11]?.times.includes(/*satTime*/ ctx[10]);

			if (show_if) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_17(ctx);
					if_block0.c();
					if_block0.m(select1, if_block0_anchor);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*satMeta*/ 2048 | dirty[1] & /*displayTime*/ 16) {
				each_value_3 = ensure_array_like(/*satMeta*/ ctx[11]?.times || []);
				let i;

				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3(ctx, each_value_3, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_3.length;
			}

			if (dirty[0] & /*satMeta*/ 2048 && select1_disabled_value !== (select1_disabled_value = !/*satMeta*/ ctx[11])) {
				select1.disabled = select1_disabled_value;
			}

			if (dirty[0] & /*satTime, satMeta*/ 3072) {
				select_option(select1, /*satTime*/ ctx[10]);
			}

			if (dirty[0] & /*satMeta*/ 2048 && button_disabled_value !== (button_disabled_value = !/*satMeta*/ ctx[11])) {
				button.disabled = button_disabled_value;
			}

			if (/*satError*/ ctx[28]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_16(ctx);
					if_block1.c();
					if_block1.m(t8.parentNode, t8);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*satMetaLoading*/ ctx[30] || /*satLoading*/ ctx[29]) {
				if (if_block2) ; else {
					if_block2 = create_if_block_15();
					if_block2.c();
					if_block2.m(t9.parentNode, t9);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*satTime*/ ctx[10]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_14(ctx);
					if_block3.c();
					if_block3.m(t10.parentNode, t10);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (/*satDelayed*/ ctx[32]) {
				if (if_block4) ; else {
					if_block4 = create_if_block_13();
					if_block4.c();
					if_block4.m(t11.parentNode, t11);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}

			if (dirty[0] & /*satSource*/ 512 && t12_value !== (t12_value = (/*satSource*/ ctx[9] === 'global'
			? 'Three-hour dust RGB composite from several geostationary satellites.'
			: 'Ten-minute Meteosat Dust RGB for Europe, Africa and the Middle East.') + "")) set_data(t12, t12_value);
		},
		d(detaching) {
			if (detaching) {
				detach(label0);
				detach(t3);
				detach(label1);
				detach(t5);
				detach(button);
				detach(t7);
				detach(t8);
				detach(t9);
				detach(t10);
				detach(t11);
				detach(p0);
				detach(t14);
				detach(p1);
				detach(t16);
				detach(small);
			}

			if (if_block0) if_block0.d();
			destroy_each(each_blocks, detaching);
			if (if_block1) if_block1.d(detaching);
			if (if_block2) if_block2.d(detaching);
			if (if_block3) if_block3.d(detaching);
			if (if_block4) if_block4.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (502:4) {#if view === 'forecast'}
function create_if_block_2(ctx) {
	let div0;
	let select;
	let option0;
	let option1;
	let option2;
	let label0;
	let input0;
	let t3;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8;
	let div1;
	let span;
	let t9_value = FIELD_INFO[/*field*/ ctx[4]].label + "";
	let t9;
	let t10;
	let strong;
	let t11_value = /*format*/ ctx[36](/*sample*/ ctx[14]?.[/*field*/ ctx[4]], /*field*/ ctx[4] === 'dustAod' ? 2 : 1) + "";
	let t11;
	let t12;
	let t13;
	let dl;
	let div2;
	let dt0;
	let dd0;
	let t15_value = /*format*/ ctx[36](/*sample*/ ctx[14]?.dustSurface) + "";
	let t15;
	let t16;
	let div3;
	let dt1;
	let dd1;
	let t18_value = /*format*/ ctx[36](/*sample*/ ctx[14]?.dustFine) + "";
	let t18;
	let t19;
	let div4;
	let dt2;
	let dd2;
	let t21_value = /*format*/ ctx[36](/*sample*/ ctx[14]?.dustAod, 2) + "";
	let t21;
	let t22;
	let div5;
	let label1;
	let t23;
	let input1;
	let t24;
	let t25;
	let p_1;

	let t26_value = (/*guidance*/ ctx[33] === 'met'
	? 'Above your surface-dust threshold'
	: /*guidance*/ ctx[33] === 'below'
		? 'Below your surface-dust threshold'
		: 'Threshold status unavailable') + "";

	let t26;
	let small0;
	let t28;
	let t29;
	let details0;
	let summary0;
	let div6;
	let t31;
	let details1;
	let summary1;
	let t33;
	let t34;
	let t35;
	let small1;
	let t36;
	let mounted;
	let dispose;
	let if_block0 = /*error*/ ctx[18] && create_if_block_12(ctx);
	let if_block1 = /*frameError*/ ctx[19] && create_if_block_11(ctx);
	let if_block2 = (/*loading*/ ctx[16] || /*frameLoading*/ ctx[17]) && create_if_block_10(ctx);
	let if_block3 = /*stale*/ ctx[12] && create_if_block_9();
	let if_block4 = /*sample*/ ctx[14]?.[/*field*/ ctx[4]] != null && create_if_block_8(ctx);

	function select_block_type_3(ctx, dirty) {
		if (/*desired*/ ctx[13]) return create_if_block_7;
		return create_else_block_2;
	}

	let current_block_type = select_block_type_3(ctx);
	let if_block5 = current_block_type(ctx);
	let if_block6 = /*showDust*/ ctx[2] && create_if_block_6(ctx);
	let each_value_1 = ensure_array_like(/*forecast*/ ctx[0]?.frames || []);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	function select_block_type_4(ctx, dirty) {
		if (/*seriesLoading*/ ctx[26]) return create_if_block_5;
		return create_else_block_1;
	}

	let current_block_type_1 = select_block_type_4(ctx);
	let if_block7 = current_block_type_1(ctx);
	let if_block8 = /*seriesRows*/ ctx[25].length && create_if_block_4(ctx);
	let if_block9 = /*sample*/ ctx[14] && create_if_block_3(ctx);

	return {
		c() {
			div0 = element("div");
			select = element("select");
			option0 = element("option");
			option0.textContent = "Surface dust";
			option1 = element("option");
			option1.textContent = "Fine dust · PM₂.₅ component";
			option2 = element("option");
			option2.textContent = "Dust optical depth";
			label0 = element("label");
			input0 = element("input");
			t3 = text("Map");
			t4 = space();
			if (if_block0) if_block0.c();
			t5 = space();
			if (if_block1) if_block1.c();
			t6 = space();
			if (if_block2) if_block2.c();
			t7 = space();
			if (if_block3) if_block3.c();
			t8 = space();
			div1 = element("div");
			span = element("span");
			t9 = text(t9_value);
			t10 = text(" · forecast");
			strong = element("strong");
			t11 = text(t11_value);
			if (if_block4) if_block4.c();
			t12 = space();
			if_block5.c();
			t13 = space();
			dl = element("dl");
			div2 = element("div");
			dt0 = element("dt");
			dt0.textContent = "Surface dust";
			dd0 = element("dd");
			t15 = text(t15_value);
			t16 = text(" µg/m³");
			div3 = element("div");
			dt1 = element("dt");
			dt1.textContent = "Fine dust component";
			dd1 = element("dd");
			t18 = text(t18_value);
			t19 = text(" µg/m³");
			div4 = element("div");
			dt2 = element("dt");
			dt2.textContent = "Dust optical depth";
			dd2 = element("dd");
			t21 = text(t21_value);
			t22 = space();
			div5 = element("div");
			label1 = element("label");
			t23 = text("Point alert above");
			input1 = element("input");
			t24 = text("µg/m³");
			t25 = space();
			p_1 = element("p");
			t26 = text(t26_value);
			small0 = element("small");
			small0.textContent = "Custom model threshold · not an official warning or health limit.";
			t28 = space();
			if (if_block6) if_block6.c();
			t29 = space();
			details0 = element("details");
			summary0 = element("summary");
			summary0.textContent = "Forecast periods";
			div6 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t31 = space();
			details1 = element("details");
			summary1 = element("summary");
			summary1.textContent = "Point forecast";
			t33 = space();
			if_block7.c();
			t34 = space();
			if (if_block8) if_block8.c();
			t35 = space();
			small1 = element("small");
			t36 = text("Native grid: 0.25° latitude × 0.3125° longitude.");
			if (if_block9) if_block9.c();
			option0.__value = "dustSurface";
			set_input_value(option0, option0.__value);
			option1.__value = "dustFine";
			set_input_value(option1, option1.__value);
			option2.__value = "dustAod";
			set_input_value(option2, option2.__value);
			attr(select, "aria-label", "Dust field");
			attr(select, "class", "svelte-1b6hqhz");
			if (/*field*/ ctx[4] === void 0) add_render_callback(() => /*select_change_handler_3*/ ctx[76].call(select));
			attr(input0, "aria-label", "Show dust map");
			attr(input0, "type", "checkbox");
			attr(input0, "class", "svelte-1b6hqhz");
			attr(label0, "class", "svelte-1b6hqhz");
			attr(div0, "class", "field-controls svelte-1b6hqhz");
			attr(span, "class", "svelte-1b6hqhz");
			attr(strong, "data-testid", "point-value");
			attr(strong, "class", "svelte-1b6hqhz");
			attr(div1, "class", "reading svelte-1b6hqhz");
			attr(dt0, "class", "svelte-1b6hqhz");
			attr(dd0, "class", "svelte-1b6hqhz");
			attr(div2, "class", "svelte-1b6hqhz");
			attr(dt1, "class", "svelte-1b6hqhz");
			attr(dd1, "class", "svelte-1b6hqhz");
			attr(div3, "class", "svelte-1b6hqhz");
			attr(dt2, "class", "svelte-1b6hqhz");
			attr(dd2, "class", "svelte-1b6hqhz");
			attr(div4, "class", "svelte-1b6hqhz");
			attr(dl, "class", "svelte-1b6hqhz");
			attr(input1, "aria-label", "Dust threshold");
			attr(input1, "type", "number");
			attr(input1, "min", "1");
			attr(input1, "step", "10");
			attr(input1, "class", "svelte-1b6hqhz");
			attr(label1, "class", "svelte-1b6hqhz");
			attr(p_1, "data-testid", "threshold-state");
			attr(p_1, "class", "svelte-1b6hqhz");
			toggle_class(p_1, "met", /*guidance*/ ctx[33] === 'met');
			attr(small0, "class", "svelte-1b6hqhz");
			attr(div5, "class", "threshold svelte-1b6hqhz");
			attr(summary0, "class", "svelte-1b6hqhz");
			attr(div6, "class", "timeline svelte-1b6hqhz");
			attr(details0, "class", "svelte-1b6hqhz");
			attr(summary1, "class", "svelte-1b6hqhz");
			attr(details1, "class", "svelte-1b6hqhz");
			attr(small1, "class", "resolution svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, select);
			append(select, option0);
			append(select, option1);
			append(select, option2);
			select_option(select, /*field*/ ctx[4], true);
			append(div0, label0);
			append(label0, input0);
			input0.checked = /*showDust*/ ctx[2];
			append(label0, t3);
			insert(target, t4, anchor);
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t5, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, t6, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert(target, t7, anchor);
			if (if_block3) if_block3.m(target, anchor);
			insert(target, t8, anchor);
			insert(target, div1, anchor);
			append(div1, span);
			append(span, t9);
			append(span, t10);
			append(div1, strong);
			append(strong, t11);
			if (if_block4) if_block4.m(strong, null);
			append(div1, t12);
			if_block5.m(div1, null);
			insert(target, t13, anchor);
			insert(target, dl, anchor);
			append(dl, div2);
			append(div2, dt0);
			append(div2, dd0);
			append(dd0, t15);
			append(dd0, t16);
			append(dl, div3);
			append(div3, dt1);
			append(div3, dd1);
			append(dd1, t18);
			append(dd1, t19);
			append(dl, div4);
			append(div4, dt2);
			append(div4, dd2);
			append(dd2, t21);
			insert(target, t22, anchor);
			insert(target, div5, anchor);
			append(div5, label1);
			append(label1, t23);
			append(label1, input1);
			set_input_value(input1, /*threshold*/ ctx[7]);
			append(label1, t24);
			append(div5, t25);
			append(div5, p_1);
			append(p_1, t26);
			append(div5, small0);
			insert(target, t28, anchor);
			if (if_block6) if_block6.m(target, anchor);
			insert(target, t29, anchor);
			insert(target, details0, anchor);
			append(details0, summary0);
			append(details0, div6);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div6, null);
				}
			}

			insert(target, t31, anchor);
			insert(target, details1, anchor);
			append(details1, summary1);
			append(details1, t33);
			if_block7.m(details1, null);
			append(details1, t34);
			if (if_block8) if_block8.m(details1, null);
			insert(target, t35, anchor);
			insert(target, small1, anchor);
			append(small1, t36);
			if (if_block9) if_block9.m(small1, null);

			if (!mounted) {
				dispose = [
					listen(select, "change", /*select_change_handler_3*/ ctx[76]),
					listen(select, "change", /*savePreferences*/ ctx[37]),
					listen(input0, "change", /*input0_change_handler_2*/ ctx[77]),
					listen(input1, "input", /*input1_input_handler_1*/ ctx[78]),
					listen(input1, "change", /*savePreferences*/ ctx[37])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*field*/ 16) {
				select_option(select, /*field*/ ctx[4]);
			}

			if (dirty[0] & /*showDust*/ 4) {
				input0.checked = /*showDust*/ ctx[2];
			}

			if (/*error*/ ctx[18]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_12(ctx);
					if_block0.c();
					if_block0.m(t5.parentNode, t5);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*frameError*/ ctx[19]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_11(ctx);
					if_block1.c();
					if_block1.m(t6.parentNode, t6);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*loading*/ ctx[16] || /*frameLoading*/ ctx[17]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_10(ctx);
					if_block2.c();
					if_block2.m(t7.parentNode, t7);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*stale*/ ctx[12]) {
				if (if_block3) ; else {
					if_block3 = create_if_block_9();
					if_block3.c();
					if_block3.m(t8.parentNode, t8);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (dirty[0] & /*field*/ 16 && t9_value !== (t9_value = FIELD_INFO[/*field*/ ctx[4]].label + "")) set_data(t9, t9_value);
			if (dirty[0] & /*sample, field*/ 16400 && t11_value !== (t11_value = /*format*/ ctx[36](/*sample*/ ctx[14]?.[/*field*/ ctx[4]], /*field*/ ctx[4] === 'dustAod' ? 2 : 1) + "")) set_data(t11, t11_value);

			if (/*sample*/ ctx[14]?.[/*field*/ ctx[4]] != null) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block_8(ctx);
					if_block4.c();
					if_block4.m(strong, null);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}

			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block5) {
				if_block5.p(ctx, dirty);
			} else {
				if_block5.d(1);
				if_block5 = current_block_type(ctx);

				if (if_block5) {
					if_block5.c();
					if_block5.m(div1, null);
				}
			}

			if (dirty[0] & /*sample*/ 16384 && t15_value !== (t15_value = /*format*/ ctx[36](/*sample*/ ctx[14]?.dustSurface) + "")) set_data(t15, t15_value);
			if (dirty[0] & /*sample*/ 16384 && t18_value !== (t18_value = /*format*/ ctx[36](/*sample*/ ctx[14]?.dustFine) + "")) set_data(t18, t18_value);
			if (dirty[0] & /*sample*/ 16384 && t21_value !== (t21_value = /*format*/ ctx[36](/*sample*/ ctx[14]?.dustAod, 2) + "")) set_data(t21, t21_value);

			if (dirty[0] & /*threshold*/ 128 && to_number(input1.value) !== /*threshold*/ ctx[7]) {
				set_input_value(input1, /*threshold*/ ctx[7]);
			}

			if (dirty[1] & /*guidance*/ 4 && t26_value !== (t26_value = (/*guidance*/ ctx[33] === 'met'
			? 'Above your surface-dust threshold'
			: /*guidance*/ ctx[33] === 'below'
				? 'Below your surface-dust threshold'
				: 'Threshold status unavailable') + "")) set_data(t26, t26_value);

			if (dirty[1] & /*guidance*/ 4) {
				toggle_class(p_1, "met", /*guidance*/ ctx[33] === 'met');
			}

			if (/*showDust*/ ctx[2]) {
				if (if_block6) {
					if_block6.p(ctx, dirty);
				} else {
					if_block6 = create_if_block_6(ctx);
					if_block6.c();
					if_block6.m(t29.parentNode, t29);
				}
			} else if (if_block6) {
				if_block6.d(1);
				if_block6 = null;
			}

			if (dirty[0] & /*desired, forecast*/ 8193 | dirty[1] & /*displayTime*/ 16) {
				each_value_1 = ensure_array_like(/*forecast*/ ctx[0]?.frames || []);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div6, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if (current_block_type_1 === (current_block_type_1 = select_block_type_4(ctx)) && if_block7) {
				if_block7.p(ctx, dirty);
			} else {
				if_block7.d(1);
				if_block7 = current_block_type_1(ctx);

				if (if_block7) {
					if_block7.c();
					if_block7.m(details1, t34);
				}
			}

			if (/*seriesRows*/ ctx[25].length) {
				if (if_block8) {
					if_block8.p(ctx, dirty);
				} else {
					if_block8 = create_if_block_4(ctx);
					if_block8.c();
					if_block8.m(details1, null);
				}
			} else if (if_block8) {
				if_block8.d(1);
				if_block8 = null;
			}

			if (/*sample*/ ctx[14]) {
				if (if_block9) {
					if_block9.p(ctx, dirty);
				} else {
					if_block9 = create_if_block_3(ctx);
					if_block9.c();
					if_block9.m(small1, null);
				}
			} else if (if_block9) {
				if_block9.d(1);
				if_block9 = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div0);
				detach(t4);
				detach(t5);
				detach(t6);
				detach(t7);
				detach(t8);
				detach(div1);
				detach(t13);
				detach(dl);
				detach(t22);
				detach(div5);
				detach(t28);
				detach(t29);
				detach(details0);
				detach(t31);
				detach(details1);
				detach(t35);
				detach(small1);
			}

			if (if_block0) if_block0.d(detaching);
			if (if_block1) if_block1.d(detaching);
			if (if_block2) if_block2.d(detaching);
			if (if_block3) if_block3.d(detaching);
			if (if_block4) if_block4.d();
			if_block5.d();
			if (if_block6) if_block6.d(detaching);
			destroy_each(each_blocks, detaching);
			if_block7.d();
			if (if_block8) if_block8.d();
			if (if_block9) if_block9.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (526:8) {#if satTime && !satMeta?.times.includes(satTime)}
function create_if_block_17(ctx) {
	let option;
	let t_value = /*displayTime*/ ctx[35](/*satTime*/ ctx[10]) + "";
	let t;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = /*satTime*/ ctx[10];
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*satTime*/ 1024 && t_value !== (t_value = /*displayTime*/ ctx[35](/*satTime*/ ctx[10]) + "")) set_data(t, t_value);

			if (dirty[0] & /*satTime, satMeta*/ 3072) {
				option.__value = /*satTime*/ ctx[10];
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

// (527:8) {#each satMeta?.times || [] as time}
function create_each_block_3(ctx) {
	let option;
	let t_value = /*displayTime*/ ctx[35](/*time*/ ctx[125]) + "";
	let t;
	let option_value_value;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*time*/ ctx[125];
			set_input_value(option, option.__value);
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*satMeta*/ 2048 && t_value !== (t_value = /*displayTime*/ ctx[35](/*time*/ ctx[125]) + "")) set_data(t, t_value);

			if (dirty[0] & /*satMeta*/ 2048 && option_value_value !== (option_value_value = /*time*/ ctx[125])) {
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

// (530:6) {#if satError}
function create_if_block_16(ctx) {
	let p_1;
	let t;

	return {
		c() {
			p_1 = element("p");
			t = text(/*satError*/ ctx[28]);
			attr(p_1, "class", "error svelte-1b6hqhz");
			attr(p_1, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
			append(p_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*satError*/ 268435456) set_data(t, /*satError*/ ctx[28]);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (531:6) {#if satMetaLoading || satLoading}
function create_if_block_15(ctx) {
	let p_1;

	return {
		c() {
			p_1 = element("p");
			p_1.textContent = "Loading satellite observations…";
			attr(p_1, "class", "loading svelte-1b6hqhz");
			attr(p_1, "role", "status");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (532:6) {#if satTime}
function create_if_block_14(ctx) {
	let p_1;
	let t0;
	let t1_value = /*displayTime*/ ctx[35](/*satTime*/ ctx[10]) + "";
	let t1;

	return {
		c() {
			p_1 = element("p");
			t0 = text("Observed ");
			t1 = text(t1_value);
			attr(p_1, "class", "observation svelte-1b6hqhz");
			attr(p_1, "data-testid", "observation-stamp");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
			append(p_1, t0);
			append(p_1, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*satTime*/ 1024 && t1_value !== (t1_value = /*displayTime*/ ctx[35](/*satTime*/ ctx[10]) + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (533:6) {#if satDelayed}
function create_if_block_13(ctx) {
	let p_1;

	return {
		c() {
			p_1 = element("p");
			p_1.textContent = "The latest available imagery is delayed. Check its observation time.";
			attr(p_1, "class", "error svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (504:6) {#if error}
function create_if_block_12(ctx) {
	let p_1;
	let t;

	return {
		c() {
			p_1 = element("p");
			t = text(/*error*/ ctx[18]);
			attr(p_1, "class", "error svelte-1b6hqhz");
			attr(p_1, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
			append(p_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*error*/ 262144) set_data(t, /*error*/ ctx[18]);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (505:6) {#if frameError}
function create_if_block_11(ctx) {
	let p_1;
	let t;

	return {
		c() {
			p_1 = element("p");
			t = text(/*frameError*/ ctx[19]);
			attr(p_1, "class", "error svelte-1b6hqhz");
			attr(p_1, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
			append(p_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*frameError*/ 524288) set_data(t, /*frameError*/ ctx[19]);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (506:6) {#if loading || frameLoading}
function create_if_block_10(ctx) {
	let p_1;

	let t_value = (/*loading*/ ctx[16]
	? 'Reading GEOS forecast…'
	: 'Loading native GEOS detail…') + "";

	let t;

	return {
		c() {
			p_1 = element("p");
			t = text(t_value);
			attr(p_1, "class", "loading svelte-1b6hqhz");
			attr(p_1, "role", "status");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
			append(p_1, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*loading*/ 65536 && t_value !== (t_value = (/*loading*/ ctx[16]
			? 'Reading GEOS forecast…'
			: 'Loading native GEOS detail…') + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (507:6) {#if stale}
function create_if_block_9(ctx) {
	let p_1;

	return {
		c() {
			p_1 = element("p");
			p_1.textContent = "Forecast expired or model run older than 36 hours. Map hidden.";
			attr(p_1, "class", "error svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, p_1, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(p_1);
			}
		}
	};
}

// (508:164) {#if sample?.[field] != null}
function create_if_block_8(ctx) {
	let small;
	let t_value = FIELD_INFO[/*field*/ ctx[4]].units + "";
	let t;

	return {
		c() {
			small = element("small");
			t = text(t_value);
			attr(small, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*field*/ 16 && t_value !== (t_value = FIELD_INFO[/*field*/ ctx[4]].units + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (509:107) {:else}
function create_else_block_2(ctx) {
	let small;

	let t_value = (/*enabled*/ ctx[1]
	? 'No forecast at the selected Windy time'
	: 'Plugin disabled') + "";

	let t;

	return {
		c() {
			small = element("small");
			t = text(t_value);
			attr(small, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*enabled*/ 2 && t_value !== (t_value = (/*enabled*/ ctx[1]
			? 'No forecast at the selected Windy time'
			: 'Plugin disabled') + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (509:8) {#if desired}
function create_if_block_7(ctx) {
	let small;
	let t0_value = /*displayTime*/ ctx[35](/*desired*/ ctx[13].start) + "";
	let t0;
	let t1;
	let t2_value = /*displayTime*/ ctx[35](/*desired*/ ctx[13].end) + "";
	let t2;
	let t3;

	return {
		c() {
			small = element("small");
			t0 = text(t0_value);
			t1 = text(" – ");
			t2 = text(t2_value);
			t3 = text(" · 3-hour mean");
			attr(small, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t0);
			append(small, t1);
			append(small, t2);
			append(small, t3);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*desired*/ 8192 && t0_value !== (t0_value = /*displayTime*/ ctx[35](/*desired*/ ctx[13].start) + "")) set_data(t0, t0_value);
			if (dirty[0] & /*desired*/ 8192 && t2_value !== (t2_value = /*displayTime*/ ctx[35](/*desired*/ ctx[13].end) + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

// (515:6) {#if showDust}
function create_if_block_6(ctx) {
	let div;
	let small;
	let t0_value = (FIELD_INFO[/*field*/ ctx[4]].units || 'Dimensionless') + "";
	let t0;
	let t1;
	let each_value_2 = ensure_array_like(FIELD_INFO[/*field*/ ctx[4]].stops);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			small = element("small");
			t0 = text(t0_value);
			t1 = text(" · missing cells stay transparent");
			attr(div, "class", "legend svelte-1b6hqhz");
			attr(small, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div, null);
				}
			}

			insert(target, small, anchor);
			append(small, t0);
			append(small, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*field*/ 16) {
				each_value_2 = ensure_array_like(FIELD_INFO[/*field*/ ctx[4]].stops);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}

			if (dirty[0] & /*field*/ 16 && t0_value !== (t0_value = (FIELD_INFO[/*field*/ ctx[4]].units || 'Dimensionless') + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
				detach(small);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (515:40) {#each FIELD_INFO[field].stops as stop, i}
function create_each_block_2(ctx) {
	let span;
	let t0_value = /*stop*/ ctx[122] + "";
	let t0;
	let t1_value = (/*i*/ ctx[124] === 5 ? '+' : '') + "";
	let t1;

	return {
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = text(t1_value);
			attr(span, "style", '--color:rgb(' + PALETTE[/*i*/ ctx[124]].join(',') + ')');
			attr(span, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*field*/ 16 && t0_value !== (t0_value = /*stop*/ ctx[122] + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (516:72) {#each forecast?.frames || [] as item}
function create_each_block_1(ctx) {
	let button;
	let t_value = /*displayTime*/ ctx[35](/*item*/ ctx[119].validTime) + "";
	let t;
	let mounted;
	let dispose;

	function click_handler_4() {
		return /*click_handler_4*/ ctx[79](/*item*/ ctx[119]);
	}

	return {
		c() {
			button = element("button");
			t = text(t_value);
			attr(button, "class", "svelte-1b6hqhz");
			toggle_class(button, "active", /*desired*/ ctx[13] === /*item*/ ctx[119]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_4);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*forecast*/ 1 && t_value !== (t_value = /*displayTime*/ ctx[35](/*item*/ ctx[119].validTime) + "")) set_data(t, t_value);

			if (dirty[0] & /*desired, forecast*/ 8193) {
				toggle_class(button, "active", /*desired*/ ctx[13] === /*item*/ ctx[119]);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (519:8) {:else}
function create_else_block_1(ctx) {
	let button;
	let t0;
	let button_disabled_value;
	let small;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			t0 = text("Load full point forecast");
			small = element("small");
			small.textContent = "Downloads native forecast frames; may use tens of MB.";
			button.disabled = button_disabled_value = !/*forecast*/ ctx[0] || /*stale*/ ctx[12] || !/*enabled*/ ctx[1];
			attr(button, "class", "svelte-1b6hqhz");
			attr(small, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			insert(target, small, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*loadSeries*/ ctx[45]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*forecast, stale, enabled*/ 4099 && button_disabled_value !== (button_disabled_value = !/*forecast*/ ctx[0] || /*stale*/ ctx[12] || !/*enabled*/ ctx[1])) {
				button.disabled = button_disabled_value;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button);
				detach(small);
			}

			mounted = false;
			dispose();
		}
	};
}

// (518:8) {#if seriesLoading}
function create_if_block_5(ctx) {
	let button;
	let small;
	let t1;
	let t2;
	let t3_value = (/*forecast*/ ctx[0]?.frames.length || 0) + "";
	let t3;
	let t4;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "Cancel download";
			small = element("small");
			t1 = text(/*seriesDone*/ ctx[27]);
			t2 = text("/");
			t3 = text(t3_value);
			t4 = text(" periods read");
			attr(button, "class", "svelte-1b6hqhz");
			attr(small, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			insert(target, small, anchor);
			append(small, t1);
			append(small, t2);
			append(small, t3);
			append(small, t4);

			if (!mounted) {
				dispose = listen(button, "click", /*cancelSeries*/ ctx[42]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*seriesDone*/ 134217728) set_data(t1, /*seriesDone*/ ctx[27]);
			if (dirty[0] & /*forecast*/ 1 && t3_value !== (t3_value = (/*forecast*/ ctx[0]?.frames.length || 0) + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) {
				detach(button);
				detach(small);
			}

			mounted = false;
			dispose();
		}
	};
}

// (520:8) {#if seriesRows.length}
function create_if_block_4(ctx) {
	let div;
	let table;
	let thead;
	let tbody;
	let each_value = ensure_array_like(/*seriesRows*/ ctx[25]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");
			table = element("table");
			thead = element("thead");
			thead.innerHTML = `<tr><th class="svelte-1b6hqhz">Period start</th><th class="svelte-1b6hqhz">Surface µg/m³</th><th class="svelte-1b6hqhz">Fine µg/m³</th><th class="svelte-1b6hqhz">AOD</th></tr>`;
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(table, "class", "svelte-1b6hqhz");
			attr(div, "class", "series svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, table);
			append(table, thead);
			append(table, tbody);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(tbody, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*seriesRows*/ 33554432 | dirty[1] & /*format, displayTime*/ 48) {
				each_value = ensure_array_like(/*seriesRows*/ ctx[25]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tbody, null);
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

// (520:163) {#each seriesRows as row}
function create_each_block(ctx) {
	let tr;
	let td0;
	let button;
	let t0_value = /*displayTime*/ ctx[35](/*row*/ ctx[116].start) + "";
	let t0;
	let td1;
	let t1_value = /*format*/ ctx[36](/*row*/ ctx[116].value?.dustSurface) + "";
	let t1;
	let td2;
	let t2_value = /*format*/ ctx[36](/*row*/ ctx[116].value?.dustFine) + "";
	let t2;
	let td3;
	let t3_value = /*format*/ ctx[36](/*row*/ ctx[116].value?.dustAod, 2) + "";
	let t3;
	let mounted;
	let dispose;

	function click_handler_5() {
		return /*click_handler_5*/ ctx[80](/*row*/ ctx[116]);
	}

	return {
		c() {
			tr = element("tr");
			td0 = element("td");
			button = element("button");
			t0 = text(t0_value);
			td1 = element("td");
			t1 = text(t1_value);
			td2 = element("td");
			t2 = text(t2_value);
			td3 = element("td");
			t3 = text(t3_value);
			attr(button, "class", "svelte-1b6hqhz");
			attr(td0, "class", "svelte-1b6hqhz");
			attr(td1, "class", "svelte-1b6hqhz");
			attr(td2, "class", "svelte-1b6hqhz");
			attr(td3, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, tr, anchor);
			append(tr, td0);
			append(td0, button);
			append(button, t0);
			append(tr, td1);
			append(td1, t1);
			append(tr, td2);
			append(td2, t2);
			append(tr, td3);
			append(td3, t3);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_5);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*seriesRows*/ 33554432 && t0_value !== (t0_value = /*displayTime*/ ctx[35](/*row*/ ctx[116].start) + "")) set_data(t0, t0_value);
			if (dirty[0] & /*seriesRows*/ 33554432 && t1_value !== (t1_value = /*format*/ ctx[36](/*row*/ ctx[116].value?.dustSurface) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*seriesRows*/ 33554432 && t2_value !== (t2_value = /*format*/ ctx[36](/*row*/ ctx[116].value?.dustFine) + "")) set_data(t2, t2_value);
			if (dirty[0] & /*seriesRows*/ 33554432 && t3_value !== (t3_value = /*format*/ ctx[36](/*row*/ ctx[116].value?.dustAod, 2) + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) {
				detach(tr);
			}

			mounted = false;
			dispose();
		}
	};
}

// (522:80) {#if sample}
function create_if_block_3(ctx) {
	let t0;
	let t1_value = /*sample*/ ctx[14].lat.toFixed(3) + "";
	let t1;
	let t2;
	let t3_value = /*sample*/ ctx[14].lon.toFixed(3) + "";
	let t3;
	let t4;

	return {
		c() {
			t0 = text("Nearest node: ");
			t1 = text(t1_value);
			t2 = text("°, ");
			t3 = text(t3_value);
			t4 = text("°.");
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
			insert(target, t2, anchor);
			insert(target, t3, anchor);
			insert(target, t4, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*sample*/ 16384 && t1_value !== (t1_value = /*sample*/ ctx[14].lat.toFixed(3) + "")) set_data(t1, t1_value);
			if (dirty[0] & /*sample*/ 16384 && t3_value !== (t3_value = /*sample*/ ctx[14].lon.toFixed(3) + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
				detach(t2);
				detach(t3);
				detach(t4);
			}
		}
	};
}

// (545:6) {#if forecast}
function create_if_block_1(ctx) {
	let small;
	let t0;
	let t1_value = new Date(/*forecast*/ ctx[0].runTime).toISOString().slice(0, 16).replace('T', ' ') + "";
	let t1;
	let t2;
	let br;
	let t3;
	let t4_value = /*displayTime*/ ctx[35](/*forecast*/ ctx[0].retrievedAt) + "";
	let t4;
	let t5;

	return {
		c() {
			small = element("small");
			t0 = text("GEOS run ");
			t1 = text(t1_value);
			t2 = text(" UTC");
			br = element("br");
			t3 = text("Retrieved ");
			t4 = text(t4_value);
			t5 = text(" · display times use your device timezone");
			attr(small, "class", "svelte-1b6hqhz");
		},
		m(target, anchor) {
			insert(target, small, anchor);
			append(small, t0);
			append(small, t1);
			append(small, t2);
			append(small, br);
			append(small, t3);
			append(small, t4);
			append(small, t5);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*forecast*/ 1 && t1_value !== (t1_value = new Date(/*forecast*/ ctx[0].runTime).toISOString().slice(0, 16).replace('T', ' ') + "")) set_data(t1, t1_value);
			if (dirty[0] & /*forecast*/ 1 && t4_value !== (t4_value = /*displayTime*/ ctx[35](/*forecast*/ ctx[0].retrievedAt) + "")) set_data(t4, t4_value);
		},
		d(detaching) {
			if (detaching) {
				detach(small);
			}
		}
	};
}

function create_fragment(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*hidden*/ ctx[15]) return create_if_block;
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
	let stale;
	let desired;
	let sample;
	let guidance;
	let satDelayed;

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

	let forecast = null, activeFrame = null, texture = null;

	let enabled = true,
		showDust = true,
		hidden = false,
		view = 'forecast',
		field = 'dustSurface',
		opacity = .65;

	let loading = false, frameLoading = false, destroyed = false, mounted = false;

	let error = '',
		frameError = '',
		locationError = '',
		timestamp = Date.now(),
		now = Date.now();

	let selected = places[0],
		inputLat = selected.lat,
		inputLon = selected.lon,
		threshold = 100;

	let saved = [];
	let contourOptions = defaultContours(), contourLayer = null;
	let contourStatus = { loading: false, errors: [], active: [] };
	let canvas = null, pointer = null, drawRequest = 0;
	let manifestAbort = null, frameAbort = null, seriesAbort = null;

	let manifestEpoch = 0,
		frameEpoch = 0,
		seriesEpoch = 0,
		frameKey = '',
		seriesRows = [],
		seriesLoading = false,
		seriesDone = 0;

	let timer, refreshTimer, timestampListener, resizeObserver = null;

	const native = new NativeForecast({
			cacheSize: window.innerWidth < 600 ? 1 : 2
		});

	let satSource = 'global', satTime = '', satMeta = null, satFrame = null;
	let satError = '', satLoading = false, satMetaLoading = false, followLatest = true;
	let satMetaAbort = null, satAbort = null;
	let satMetaEpoch = 0, satEpoch = 0, satelliteTimer;

	const displayTime = value => new Date(value).toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	const format = (value, digits = 1) => value === null || value === undefined || !Number.isFinite(value)
	? 'Unavailable'
	: value > 0 && value < 10 ** -digits
		? '<' + (10 ** -digits).toFixed(digits)
		: value.toFixed(digits);

	function savePreferences() {
		try {
			localStorage.setItem('geos-dust.preferences.v1', JSON.stringify({
				selected,
				threshold,
				field,
				opacity,
				saved,
				contourOptions
			}));
		} catch {
			
		}
	}

	function restorePreferences() {
		try {
			const p = JSON.parse(localStorage.getItem('geos-dust.preferences.v1') || 'null');
			if (!p) return;
			$$invalidate(8, contourOptions = safeContourOptions(p.contourOptions));

			if (p.selected && Number.isFinite(p.selected.lat) && Math.abs(p.selected.lat) <= 90 && Number.isFinite(p.selected.lon)) {
				$$invalidate(6, selected = {
					name: String(p.selected.name || 'Saved location').slice(0, 80),
					lat: p.selected.lat,
					lon: wrapLongitude(p.selected.lon)
				});

				$$invalidate(21, inputLat = selected.lat);
				$$invalidate(22, inputLon = selected.lon);
			}

			if (Number.isFinite(p.threshold) && p.threshold > 0) $$invalidate(7, threshold = p.threshold);
			if (FIELD_INFO[p.field]) $$invalidate(4, field = p.field);
			if (Number.isFinite(p.opacity) && p.opacity >= .15 && p.opacity <= 1) $$invalidate(5, opacity = p.opacity);

			$$invalidate(23, saved = Array.isArray(p.saved)
			? p.saved.filter(v => Number.isFinite(v.lat) && Math.abs(v.lat) <= 90 && Number.isFinite(v.lon)).slice(0, 8)
			: []);
		} catch {
			
		}
	}

	function savePlace() {
		if (saved.some(p => p.lat === selected.lat && p.lon === selected.lon)) $$invalidate(23, saved = saved.filter(p => p.lat !== selected.lat || p.lon !== selected.lon)); else $$invalidate(23, saved = [...saved.slice(-7), { ...selected }]);
		savePreferences();
	}

	function synopticPreset() {
		$$invalidate(8, contourOptions = {
			...contourOptions,
			gh: {
				...contourOptions.gh,
				on: true,
				level: 500
			},
			temp: {
				...contourOptions.temp,
				on: true,
				level: 850
			},
			mslp: { ...contourOptions.mslp, on: true }
		});

		savePreferences();
	}

	function clearContours() {
		$$invalidate(8, contourOptions = {
			...contourOptions,
			...Object.fromEntries(Object.keys(CONTOUR_FIELDS).map(k => [k, { ...contourOptions[k], on: false }]))
		});

		savePreferences();
	}

	function refreshAll() {
		contourLayer?.refresh();
		return view === 'forecast' ? load() : refreshSatellite();
	}

	function cancelSeries() {
		seriesEpoch++;
		seriesAbort?.abort();
		seriesAbort = null;
		$$invalidate(26, seriesLoading = false);
	}

	function selectPoint(value) {
		if (!enabled) return;
		const lat = value?.lat ?? value?.latitude ?? value?.latlng?.lat;
		const rawLon = value?.lon ?? value?.lng ?? value?.longitude ?? value?.latlng?.lng;

		if (typeof lat !== 'number' || typeof rawLon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(rawLon) || Math.abs(lat) > 90) {
			$$invalidate(20, locationError = 'Enter latitude from −90 to 90 and a finite longitude.');
			return;
		}

		cancelSeries();
		$$invalidate(25, seriesRows = []);
		$$invalidate(27, seriesDone = 0);
		const lon = wrapLongitude(rawLon);
		$$invalidate(20, locationError = '');

		$$invalidate(6, selected = {
			name: typeof value.name === 'string'
			? value.name.slice(0, 80)
			: `Point ${lat.toFixed(3)}, ${lon.toFixed(3)}`,
			lat,
			lon
		});

		$$invalidate(21, inputLat = lat);
		$$invalidate(22, inputLon = lon);
		if (pointer) map.removeLayer(pointer);

		if (typeof L !== 'undefined') pointer = L.circleMarker([Math.max(-85, Math.min(85, lat)), lon], {
			radius: 6,
			color: '#fff',
			fillColor: '#183047',
			fillOpacity: 1,
			weight: 2
		}).addTo(map);

		savePreferences();
	}

	function goToCoordinates() {
		selectPoint({ lat: inputLat, lon: inputLon });
		if (!locationError && enabled) map.panTo([Math.max(-85, Math.min(85, selected.lat)), selected.lon]);
	}

	function syncTexture(frame, selectedField) {
		if (texture) {
			$$invalidate(52, texture.width = 1, texture);
			$$invalidate(52, texture.height = 1, texture);
			$$invalidate(52, texture = null);
		}

		if (frame) $$invalidate(52, texture = makeTexture(NATIVE_GRID, frame, selectedField));
	}

	function scheduleRender(..._args) {
		if (destroyed || !canvas || drawRequest) return;
		drawRequest = requestAnimationFrame(paint);
	}

	function paint() {
		drawRequest = 0;
		if (!canvas || destroyed) return;

		const size = map.getSize(),
			ratio = Math.min(window.devicePixelRatio || 1, 2),
			width = Math.max(1, size.x),
			height = Math.max(1, size.y);

		if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
			$$invalidate(57, canvas.width = Math.round(width * ratio), canvas);
			$$invalidate(57, canvas.height = Math.round(height * ratio), canvas);
		}

		$$invalidate(57, canvas.style.width = width + 'px', canvas);
		$$invalidate(57, canvas.style.height = height + 'px', canvas);
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

		try {
			if (view === 'satellite') drawSatellite(
				ctx,
				map,
				enabled && satFrame?.source === satSource && satFrame?.time === satTime
				? satFrame
				: null,
				width,
				height,
				opacity
			); else drawTexture(
				ctx,
				map,
				NATIVE_GRID,
				enabled && showDust && !stale && desired && activeFrame?.validTime === desired.validTime
				? texture
				: null,
				width,
				height,
				opacity
			);
		} catch {
			ctx.clearRect(0, 0, width, height);
		}

		contourLayer?.paint();
	}

	function stopFrame() {
		frameEpoch++;
		frameAbort?.abort();
		frameAbort = null;
		frameKey = '';
		$$invalidate(17, frameLoading = false);
		$$invalidate(51, activeFrame = null);
	}

	async function syncFrame(data, descriptor, on, expired) {
		if (!on || expired || !data || !descriptor) {
			stopFrame();
			return;
		}

		const key = native.key(data, descriptor);
		if (frameKey === key && (activeFrame || frameLoading)) return;
		stopFrame();
		const epoch = ++frameEpoch, abort = new AbortController();
		frameAbort = abort;
		frameKey = key;
		$$invalidate(19, frameError = '');
		$$invalidate(17, frameLoading = true);

		try {
			const frame = await native.get(data, descriptor, abort.signal);
			if (!destroyed && epoch === frameEpoch && enabled && view === 'forecast') $$invalidate(51, activeFrame = frame);
		} catch(err) {
			if (destroyed || epoch !== frameEpoch) return;

			$$invalidate(19, frameError = err?.name === 'AbortError'
			? 'Native forecast request timed out or was cancelled.'
			: String(err?.message || err));

			frameKey = '';
			$$invalidate(51, activeFrame = null);
		} finally {
			if (epoch === frameEpoch) $$invalidate(17, frameLoading = false);
		}
	}

	async function load() {
		manifestAbort?.abort();
		const abort = new AbortController();
		manifestAbort = abort;
		const epoch = ++manifestEpoch;
		$$invalidate(16, loading = true);
		$$invalidate(18, error = '');
		$$invalidate(19, frameError = '');
		cancelSeries();
		$$invalidate(25, seriesRows = []);
		const timeout = setTimeout(() => abort.abort(), 20000);

		try {
			const response = await fetch(DATA_BASE + 'latest.json?t=' + Math.floor(Date.now() / 300000), { signal: abort.signal });
			if (!response.ok) throw Error('GEOS forecast unavailable (HTTP ' + response.status + ')');
			const text = await response.text();
			if (text.length > 150000) throw Error('Forecast index exceeds size limit');
			const product = validateDustManifest(JSON.parse(text));
			if (forecast && Date.parse(product.runTime) < Date.parse(forecast.runTime)) throw Error('Server returned an older model run');
			if (destroyed || epoch !== manifestEpoch || !enabled) return;
			stopFrame();
			$$invalidate(0, forecast = product);
			$$invalidate(55, now = Date.now());
		} catch(err) {
			if (destroyed || epoch !== manifestEpoch) return;

			$$invalidate(18, error = err?.name === 'AbortError'
			? 'Forecast request timed out.'
			: String(err?.message || err));

			$$invalidate(0, forecast = null);
			stopFrame();
		} finally {
			clearTimeout(timeout);
			if (epoch === manifestEpoch) $$invalidate(16, loading = false);
		}
	}

	async function loadSeries() {
		if (!forecast || stale || !enabled) return;
		cancelSeries();
		const epoch = ++seriesEpoch, abort = new AbortController();
		seriesAbort = abort;
		const product = forecast, point = { ...selected };
		$$invalidate(25, seriesRows = product.frames.map(d => ({ ...d, value: null, state: 'pending' })));
		$$invalidate(27, seriesDone = 0);
		$$invalidate(26, seriesLoading = true);
		let next = 0;

		const worker = async () => {
			while (!abort.signal.aborted && !destroyed && epoch === seriesEpoch) {
				const index = next++;
				if (index >= product.frames.length) return;
				let value = null;

				try {
					value = samplePoint(NATIVE_GRID, await native.get(product, product.frames[index], abort.signal), point.lat, point.lon);
				} catch {
					
				}

				if (abort.signal.aborted || epoch !== seriesEpoch || destroyed) return;

				$$invalidate(
					25,
					seriesRows[index] = {
						...seriesRows[index],
						value,
						state: value ? 'ready' : 'unavailable'
					},
					seriesRows
				);

				$$invalidate(25, seriesRows = [...seriesRows]);
				$$invalidate(27, seriesDone++, seriesDone);
			}
		};

		await Promise.all([worker(), worker()]);
		if (epoch === seriesEpoch) $$invalidate(26, seriesLoading = false);
	}

	function cancelSatellite() {
		satMetaEpoch++;
		satEpoch++;
		satMetaAbort?.abort();
		satAbort?.abort();
		clearTimeout(satelliteTimer);
		$$invalidate(29, satLoading = false);
		$$invalidate(30, satMetaLoading = false);
		closeSatellite(satFrame);
		$$invalidate(58, satFrame = null);
	}

	async function refreshSatellite() {
		if (!mounted || !enabled || view !== 'satellite') return;
		satEpoch++;
		satAbort?.abort();
		$$invalidate(29, satLoading = false);
		closeSatellite(satFrame);
		$$invalidate(58, satFrame = null);
		satMetaAbort?.abort();
		const abort = new AbortController();
		satMetaAbort = abort;
		const epoch = ++satMetaEpoch, source = satSource;
		$$invalidate(30, satMetaLoading = true);
		$$invalidate(28, satError = '');
		const timeout = setTimeout(() => abort.abort(), 20000);

		try {
			const metadata = await satelliteMetadata(source, abort.signal);
			clearTimeout(timeout);
			if (destroyed || epoch !== satMetaEpoch || source !== satSource || view !== 'satellite') return;
			$$invalidate(11, satMeta = metadata);
			$$invalidate(55, now = Date.now());
			if (followLatest || !satTime) $$invalidate(10, satTime = metadata.latest);
			await requestSatellite();
		} catch(err) {
			if (destroyed || epoch !== satMetaEpoch) return;

			$$invalidate(28, satError = err?.name === 'AbortError'
			? 'Satellite metadata request timed out.'
			: String(err?.message || err));

			$$invalidate(11, satMeta = null);
			closeSatellite(satFrame);
			$$invalidate(58, satFrame = null);
		} finally {
			clearTimeout(timeout);
			if (epoch === satMetaEpoch) $$invalidate(30, satMetaLoading = false);
		}
	}

	async function requestSatellite() {
		if (!mounted || !enabled || view !== 'satellite' || !satTime || !satMeta) return;
		satAbort?.abort();
		const abort = new AbortController();
		satAbort = abort;
		const epoch = ++satEpoch, source = satSource, time = satTime;
		$$invalidate(29, satLoading = true);
		$$invalidate(28, satError = '');

		if (satFrame && (satFrame.source !== source || satFrame.time !== time)) {
			closeSatellite(satFrame);
			$$invalidate(58, satFrame = null);
		}

		const b = map.getBounds(),
			size = map.getSize(),
			timeout = setTimeout(() => abort.abort(), 45000);

		try {
			const frame = await satelliteFrame(
				source,
				time,
				{
					south: b.getSouth(),
					north: b.getNorth(),
					west: b.getWest(),
					east: b.getEast()
				},
				{ width: size.x, height: size.y },
				abort.signal
			);

			if (destroyed || epoch !== satEpoch || source !== satSource || time !== satTime || view !== 'satellite') {
				closeSatellite(frame);
				return;
			}

			const previous = satFrame;
			$$invalidate(58, satFrame = frame);
			closeSatellite(previous);
		} catch(err) {
			if (destroyed || epoch !== satEpoch) return;

			$$invalidate(28, satError = err?.name === 'AbortError'
			? 'Satellite image request timed out.'
			: String(err?.message || err));

			closeSatellite(satFrame);
			$$invalidate(58, satFrame = null);
		} finally {
			clearTimeout(timeout);
			if (epoch === satEpoch) $$invalidate(29, satLoading = false);
		}
	}

	function mapFinished() {
		scheduleRender();

		if (view === 'satellite' && enabled) {
			clearTimeout(satelliteTimer);
			satelliteTimer = setTimeout(() => void requestSatellite(), 400);
		}
	}

	function changeSatellite() {
		cancelSatellite();
		$$invalidate(11, satMeta = null);
		$$invalidate(10, satTime = '');
		$$invalidate(31, followLatest = true);
		void refreshSatellite();
	}

	function setView(next) {
		$$invalidate(3, view = next);
		cancelSeries();
		$$invalidate(25, seriesRows = []);

		if (view === 'satellite') {
			stopFrame();
			void refreshSatellite();
		} else {
			cancelSatellite();
			if (!forecast) void load();
		}
	}

	function toggleEnabled() {
		if (enabled) {
			register(config.name, 'high');
			if (view === 'satellite') void refreshSatellite(); else if (!forecast) void load();
		} else {
			release(config.name, 'high');
			manifestEpoch++;
			manifestAbort?.abort();
			$$invalidate(16, loading = false);
			stopFrame();
			cancelSeries();
			cancelSatellite();

			if (pointer) {
				map.removeLayer(pointer);
				pointer = null;
			}
		}
	}

	const onopen = params => {
		$$invalidate(15, hidden = false);
		if (enabled) register(config.name, 'high');
		if (params) selectPoint(params);
	};

	onMount(() => {
		$$invalidate(53, mounted = true);
		restorePreferences();

		$$invalidate(56, contourLayer = new ContourOverlay({
				map,
				onChange: value => {
					$$invalidate(24, contourStatus = value);
				},
				onRender: scheduleRender
			}));

		$$invalidate(57, canvas = document.createElement('canvas'));
		$$invalidate(57, canvas.dataset.geosDust = 'map', canvas);

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
		$$invalidate(54, timestamp = Number(store.get('timestamp')) || Date.now());

		timestampListener = store.on('timestamp', () => {
			$$invalidate(54, timestamp = Number(store.get('timestamp')));
		});

		map.on('move', scheduleRender);
		map.on('zoom', scheduleRender);
		map.on('moveend', mapFinished);
		map.on('zoomend', mapFinished);
		map.on('resize', mapFinished);

		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(mapFinished);
			resizeObserver.observe(map.getContainer());
		}

		timer = setInterval(
			() => {
				$$invalidate(55, now = Date.now());
			},
			60000
		);

		refreshTimer = setInterval(
			() => {
				if (enabled && !document.hidden && !loading) void refreshAll();
			},
			5 * 60000
		);

		void load();
	});

	onDestroy(() => {
		destroyed = true;
		$$invalidate(53, mounted = false);
		manifestEpoch++;
		manifestAbort?.abort();
		stopFrame();
		cancelSeries();
		cancelSatellite();
		native.destroy();
		contourLayer?.destroy();
		$$invalidate(56, contourLayer = null);
		clearInterval(timer);
		clearInterval(refreshTimer);
		if (drawRequest) cancelAnimationFrame(drawRequest);
		resizeObserver?.disconnect();
		canvas?.remove();
		$$invalidate(57, canvas = null);

		if (texture) {
			$$invalidate(52, texture.width = 1, texture);
			$$invalidate(52, texture.height = 1, texture);
			$$invalidate(52, texture = null);
		}

		map.off('move', scheduleRender);
		map.off('zoom', scheduleRender);
		map.off('moveend', mapFinished);
		map.off('zoomend', mapFinished);
		map.off('resize', mapFinished);
		singleclick.off(config.name, selectPoint);
		release(config.name, 'high');
		if (timestampListener != null) store.off(timestampListener);
		if (pointer) map.removeLayer(pointer);
	});

	const func = p => p.name === selected.name;
	const click_handler = () => $$invalidate(15, hidden = false);
	const click_handler_1 = () => $$invalidate(15, hidden = true);
	const click_handler_2 = () => setView('forecast');
	const click_handler_3 = () => setView('satellite');

	function input0_change_handler() {
		enabled = this.checked;
		$$invalidate(1, enabled);
	}

	function input0_change_handler_1(key) {
		contourOptions[key].on = this.checked;
		$$invalidate(8, contourOptions);
	}

	function select_change_handler(key) {
		contourOptions[key].level = select_value(this);
		$$invalidate(8, contourOptions);
	}

	function select_change_handler_1(key) {
		contourOptions[key].step = select_value(this);
		$$invalidate(8, contourOptions);
	}

	function input1_input_handler(key) {
		contourOptions[key].color = this.value;
		$$invalidate(8, contourOptions);
	}

	function input1_change_handler() {
		contourOptions.labels = this.checked;
		$$invalidate(8, contourOptions);
	}

	const func_1 = p => !places.some(v => v.name === p.name);

	function select_change_handler_2() {
		selected.name = select_value(this);
		$$invalidate(6, selected);
		$$invalidate(23, saved);
		$$invalidate(34, places);
	}

	const change_handler = e => {
		const p = [...places, ...saved].find(v => v.name === e.currentTarget.value);

		if (p) {
			selectPoint(p);
			map.panTo([Math.max(-85, Math.min(85, p.lat)), p.lon]);
		}
	};

	function input2_input_handler() {
		inputLat = to_number(this.value);
		$$invalidate(21, inputLat);
	}

	function input3_input_handler() {
		inputLon = to_number(this.value);
		$$invalidate(22, inputLon);
	}

	const func_2 = p => p.lat === selected.lat && p.lon === selected.lon;

	function select_change_handler_3() {
		field = select_value(this);
		$$invalidate(4, field);
	}

	function input0_change_handler_2() {
		showDust = this.checked;
		$$invalidate(2, showDust);
	}

	function input1_input_handler_1() {
		threshold = to_number(this.value);
		$$invalidate(7, threshold);
	}

	const click_handler_4 = item => store.set('timestamp', Date.parse(item.validTime));
	const click_handler_5 = row => store.set('timestamp', Date.parse(row.validTime));

	function select0_change_handler() {
		satSource = select_value(this);
		$$invalidate(9, satSource);
	}

	function select1_change_handler() {
		satTime = select_value(this);
		$$invalidate(10, satTime);
		$$invalidate(11, satMeta);
	}

	const change_handler_1 = () => {
		$$invalidate(31, followLatest = false);
		void requestSatellite();
	};

	const click_handler_6 = () => {
		$$invalidate(31, followLatest = true);
		$$invalidate(10, satTime = satMeta.latest);
		void requestSatellite();
	};

	function input4_change_input_handler() {
		opacity = to_number(this.value);
		$$invalidate(5, opacity);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*forecast*/ 1 | $$self.$$.dirty[1] & /*now*/ 16777216) {
			$$invalidate(12, stale = !!forecast && (now - Date.parse(forecast.runTime) > MAX_RUN_AGE_MS || Date.parse(forecast.frames.at(-1).end) <= now));
		}

		if ($$self.$$.dirty[0] & /*enabled, stale, forecast*/ 4099 | $$self.$$.dirty[1] & /*timestamp*/ 8388608) {
			$$invalidate(13, desired = enabled && !stale ? frameAt(forecast, timestamp) : null);
		}

		if ($$self.$$.dirty[0] & /*forecast, desired, enabled, view, stale*/ 12299) {
			void syncFrame(forecast, desired, enabled && view === 'forecast', stale);
		}

		if ($$self.$$.dirty[0] & /*desired, selected*/ 8256 | $$self.$$.dirty[1] & /*activeFrame*/ 1048576) {
			$$invalidate(14, sample = desired && activeFrame && activeFrame.validTime === desired.validTime
			? samplePoint(NATIVE_GRID, activeFrame, selected.lat, selected.lon)
			: null);
		}

		if ($$self.$$.dirty[0] & /*field*/ 16 | $$self.$$.dirty[1] & /*activeFrame*/ 1048576) {
			syncTexture(activeFrame, field);
		}

		if ($$self.$$.dirty[0] & /*sample, threshold*/ 16512) {
			$$invalidate(33, guidance = thresholdState(sample?.dustSurface ?? null, threshold));
		}

		if ($$self.$$.dirty[0] & /*satMeta, satSource*/ 2560 | $$self.$$.dirty[1] & /*now*/ 16777216) {
			$$invalidate(32, satDelayed = !!satMeta && now - Date.parse(satMeta.latest) > SATELLITES[satSource].maxAge);
		}

		if ($$self.$$.dirty[0] & /*enabled, showDust, stale, desired, view, satTime, satSource, opacity*/ 13870 | $$self.$$.dirty[1] & /*canvas, texture, satFrame*/ 203423744) {
			if (canvas) scheduleRender(texture, enabled, showDust, stale, desired, view, satFrame, satTime, satSource, opacity);
		}

		if ($$self.$$.dirty[0] & /*contourOptions, enabled*/ 258 | $$self.$$.dirty[1] & /*mounted, contourLayer, timestamp*/ 46137344) {
			if (mounted && contourLayer) contourLayer.set(contourOptions, timestamp, enabled);
		}
	};

	return [
		forecast,
		enabled,
		showDust,
		view,
		field,
		opacity,
		selected,
		threshold,
		contourOptions,
		satSource,
		satTime,
		satMeta,
		stale,
		desired,
		sample,
		hidden,
		loading,
		frameLoading,
		error,
		frameError,
		locationError,
		inputLat,
		inputLon,
		saved,
		contourStatus,
		seriesRows,
		seriesLoading,
		seriesDone,
		satError,
		satLoading,
		satMetaLoading,
		followLatest,
		satDelayed,
		guidance,
		places,
		displayTime,
		format,
		savePreferences,
		savePlace,
		synopticPreset,
		clearContours,
		refreshAll,
		cancelSeries,
		selectPoint,
		goToCoordinates,
		loadSeries,
		requestSatellite,
		changeSatellite,
		setView,
		toggleEnabled,
		onopen,
		activeFrame,
		texture,
		mounted,
		timestamp,
		now,
		contourLayer,
		canvas,
		satFrame,
		func,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		input0_change_handler,
		input0_change_handler_1,
		select_change_handler,
		select_change_handler_1,
		input1_input_handler,
		input1_change_handler,
		func_1,
		select_change_handler_2,
		change_handler,
		input2_input_handler,
		input3_input_handler,
		func_2,
		select_change_handler_3,
		input0_change_handler_2,
		input1_input_handler_1,
		click_handler_4,
		click_handler_5,
		select0_change_handler,
		select1_change_handler,
		change_handler_1,
		click_handler_6,
		input4_change_input_handler
	];
}

class PluginEntry extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 50 }, add_css, [-1, -1, -1, -1, -1]);
	}

	get onopen() {
		return this.$$.ctx[50];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, PluginEntry as default };
//# sourceMappingURL=plugin.js.map
