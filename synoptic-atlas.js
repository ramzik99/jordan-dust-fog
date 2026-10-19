const __pluginConfig =  {
  "name": "windy-plugin-synoptic-atlas",
  "version": "1.3.0",
  "icon": "🌐",
  "title": "Synoptic Atlas",
  "description": "Independent geopotential height and temperature isolines, with pressure levels and labels.",
  "author": "Ramzi Kandah",
  "repository": "https://github.com/ramzik99/jordan-dust-fog",
  "desktopUI": "embedded",
  "mobileUI": "small",
  "addToContextmenu": false,
  "listenToSingleclick": false,
  "built": 1792405756087,
  "builtReadable": "2026-10-19T10:29:16.087Z"
};

// transformCode: import { map } from '@windy/map';
const { map } = W.map;

// transformCode: import store from '@windy/store';
const store = W.store;

// transformCode: import broadcast from '@windy/broadcast';
const broadcast = W.broadcast;

// transformCode: import products from '@windy/products';
const products = W.products;

// transformCode: import { createFullRenderingParams, getDataZoom } from '@windy/renderUtils';
const { createFullRenderingParams, getDataZoom } = W.renderUtils;

// transformCode: import { TileLayerInterpolator } from '@windy/tileInterpolator';
const { TileLayerInterpolator } = W.tileInterpolator;

// transformCode: import { tileLayerSource } from '@windy/tileLayerSource';
const { tileLayerSource } = W.tileLayerSource;

// transformCode: import { applyUrlTemplate } from '@windy/tileHelpers';
const { applyUrlTemplate } = W.tileHelpers;


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
    name: 'windy-plugin-synoptic-atlas',
    title: 'Synoptic Atlas'};

// Windy tile sampling: model metadata and native decoded scalar fields, no external forecast fallback.
const wrapLongitude = lon => ((lon + 180) % 360 + 360) % 360 - 180;
function viewportGrid(map) {
  const b=map.getBounds(), size=map.getSize();
  const west=wrapLongitude(b.getWest()), span=Math.min(360,Math.max(.001,b.getEast()-b.getWest()));
  const south=Math.max(-85,Math.min(85,b.getSouth())), north=Math.max(south+.001,Math.min(85,b.getNorth()));
  const width=Math.max(3,Math.min(97,Math.ceil(size.x/18)+1));
  const height=Math.max(3,Math.min(73,Math.ceil(size.y/18)+1));
  return {width,height,longitudeStart:west,latitudeStart:south,step:span/(width-1),latitudeStep:(north-south)/(height-1),periodic:false};
}
function interrupted() { return new DOMException('Request cancelled','AbortError'); }
function checked(promise, signal) {
  if(signal.aborted) return Promise.reject(interrupted());
  return new Promise((resolve,reject)=>{
    const stop=()=>{signal.removeEventListener('abort',stop);reject(interrupted());};
    signal.addEventListener('abort',stop,{once:true});
    Promise.resolve(promise).then(value=>{signal.removeEventListener('abort',stop);resolve(value);},error=>{signal.removeEventListener('abort',stop);reject(error);});
  });
}
function scalarValue(raw,field) {
  const value=Array.isArray(raw)?raw[0]:NaN;
  if(typeof value!=='number'||!Number.isFinite(value))return NaN;
  // Native gh scalar is geopotential height in metres; temperature is Kelvin.
  if(field==='gh')return value>=-1e3&&value<=60000?value/10:NaN;
  return value>=100&&value<=400?value-273.15:NaN;
}
function createTileContourProvider({products,createParams,getDataZoom,Interpolator,tiles,applyUrlTemplate}) {
  let dead=false;
  const active=new Set();
  return {
    async load({map,product,timestamp,field,level,abort:parent}) {
      if(dead)throw interrupted();
      const model=products[product], nativeLevel=level+'h';
      if(!model || !['gh','temp'].includes(field))throw Error('Selected model is unavailable');
      if(field==='gh'?!model.isolines?.includes('gh'):!model.overlays?.includes('temp'))throw Error('Not available for '+(model.modelName||product));
      const levels=model.levelsOverride?.[field]||model.levels;
      if(!levels?.includes(nativeLevel))throw Error(nativeLevel+' is not available for '+(model.modelName||product));
      const abort=new AbortController(), stop=()=>abort.abort();
      parent.signal.addEventListener('abort',stop,{once:true});if(parent.signal.aborted)stop();
      active.add(abort);
      const tokens=new Map();let interpolator;
      try {
        const calendar=await checked(model.getCalendar(),abort.signal);
        const times=calendar?.timestamps;
        if(!Array.isArray(times)||!times.length||!Number.isFinite(timestamp)||timestamp<times[0]||timestamp>times.at(-1))throw Error('Outside selected model forecast range');
        const params=await checked(createParams(field,{product,overlay:field,level:nativeLevel},timestamp),abort.signal);
        if(params.product!==product||params.level!==nativeLevel)throw Error('Windy returned a different model or pressure level');
        const validTime=Date.parse(params.path.replace(/^(\d{4})\/(\d\d)\/(\d\d)\/(\d\d)$/,'$1-$2-$3T$4:00:00Z'));
        if(!Number.isFinite(validTime))throw Error('Forecast time unavailable');
        interpolator=new Interpolator();
        const sample=await checked(new Promise(resolve=>interpolator.createFun(resolve)),abort.signal);
        if(typeof sample!=='function')throw Error('Windy tile reader unavailable');
        const zoom=map.maplibreMap?.getZoom?.()??map.getZoom()-1;
        const tileZoom=Math.round(Math.max(2,Math.min(10,zoom)))+1;
        const z=getDataZoom(params,tileZoom), scale=2**z, grid=viewportGrid(map);
        const values=new Float32Array(grid.width*grid.height).fill(NaN);
        let index=0;
        await Promise.all(Array.from({length:8},async()=>{
          while(index<values.length && !abort.signal.aborted){
            const at=index++, x=at%grid.width,y=Math.floor(at/grid.width);
            const lat=grid.latitudeStart+y*grid.latitudeStep,lon=wrapLongitude(grid.longitudeStart+x*grid.step);
            if(model.pointIsInBounds&&!model.pointIsInBounds({lat,lon}))continue;
            const phi=lat*Math.PI/180;
            const url=applyUrlTemplate(params.fullPath,{z,x:Math.floor((lon+180)/360*scale),y:Math.floor((1-Math.log(Math.tan(phi)+1/Math.cos(phi))/Math.PI)/2*scale)});
            let pending=tokens.get(url);
            if(!pending){pending=tiles.get(url,abort.signal);tokens.set(url,pending);}
            const token=await checked(pending,abort.signal);
            if(!token?.value?.valid)continue;
            values[at]=scalarValue(await checked(sample({lat,lon},abort,params),abort.signal),field);
          }
        }));
        if(abort.signal.aborted)throw interrupted();
        if(!values.some(Number.isFinite))throw Error('No data for this model, area, level and time');
        return {values,grid,validTime:new Date(validTime).toISOString(),runTime:params.refTime};
      } finally {
        parent.signal.removeEventListener('abort',stop);active.delete(abort);
        abort.abort();interpolator?.destroy();
        for(const pending of tokens.values())void pending.then(token=>{if(token)tiles.free(token);},()=>{});
      }
    },
    destroy(){dead=true;for(const abort of active)abort.abort();active.clear();}
  };
}

const createWindyContourProvider = () => createTileContourProvider({
  products, createParams:createFullRenderingParams, getDataZoom, Interpolator:TileLayerInterpolator,
  tiles:tileLayerSource, applyUrlTemplate
});

// Discrete contour colors sampled from the supplied temperature and height legends.
const CONTOUR_PALETTES = {
  "temp": [
    [
      -40,
      "#050505"
    ],
    [
      -38,
      "#080808"
    ],
    [
      -36,
      "#0f100f"
    ],
    [
      -34,
      "#451e52"
    ],
    [
      -32,
      "#5b1c64"
    ],
    [
      -30,
      "#631c6a"
    ],
    [
      -28,
      "#7c1b7f"
    ],
    [
      -26,
      "#841a85"
    ],
    [
      -24,
      "#9e1999"
    ],
    [
      -22,
      "#a519a0"
    ],
    [
      -20,
      "#b518ac"
    ],
    [
      -18,
      "#e14ed1"
    ],
    [
      -16,
      "#e97ee0"
    ],
    [
      -14,
      "#d491fb"
    ],
    [
      -12,
      "#b473d8"
    ],
    [
      -10,
      "#9555b5"
    ],
    [
      -8,
      "#322b80"
    ],
    [
      -6,
      "#292991"
    ],
    [
      -4,
      "#1857bc"
    ],
    [
      -2,
      "#3f90d6"
    ],
    [
      0,
      "#66caf0"
    ],
    [
      2,
      "#20bf7b"
    ],
    [
      4,
      "#1ca44d"
    ],
    [
      6,
      "#37a421"
    ],
    [
      8,
      "#4fbb36"
    ],
    [
      10,
      "#67d34b"
    ],
    [
      12,
      "#fbdf11"
    ],
    [
      14,
      "#f5be19"
    ],
    [
      16,
      "#e36d3e"
    ],
    [
      18,
      "#eb4b2d"
    ],
    [
      20,
      "#f32a1d"
    ],
    [
      22,
      "#c82d2c"
    ],
    [
      24,
      "#9a2421"
    ],
    [
      26,
      "#552928"
    ],
    [
      28,
      "#4d232a"
    ],
    [
      30,
      "#451d2c"
    ],
    [
      32,
      "#595154"
    ],
    [
      34,
      "#999596"
    ],
    [
      36,
      "#ffffff"
    ],
    [
      38,
      "#ffffff"
    ],
    [
      40,
      "#ffffff"
    ]
  ],
  "gh": [
    [
      470,
      "#f7f7f7"
    ],
    [
      472,
      "#d4d4d4"
    ],
    [
      474,
      "#a7a7a7"
    ],
    [
      476,
      "#7a7a7a"
    ],
    [
      478,
      "#4c4c4c"
    ],
    [
      480,
      "#640090"
    ],
    [
      482,
      "#6e119b"
    ],
    [
      484,
      "#7820a6"
    ],
    [
      486,
      "#8332b1"
    ],
    [
      488,
      "#8e43bd"
    ],
    [
      490,
      "#9955c9"
    ],
    [
      492,
      "#a264d3"
    ],
    [
      494,
      "#ad75df"
    ],
    [
      496,
      "#b887eb"
    ],
    [
      498,
      "#c296f5"
    ],
    [
      500,
      "#c8a2fd"
    ],
    [
      502,
      "#b896f2"
    ],
    [
      504,
      "#ad8dec"
    ],
    [
      506,
      "#9d80e1"
    ],
    [
      508,
      "#8d74d7"
    ],
    [
      510,
      "#7d67cd"
    ],
    [
      512,
      "#6f5cc4"
    ],
    [
      514,
      "#5f4fba"
    ],
    [
      516,
      "#4f43af"
    ],
    [
      518,
      "#4137a6"
    ],
    [
      520,
      "#332f9f"
    ],
    [
      522,
      "#2d3da6"
    ],
    [
      524,
      "#284bad"
    ],
    [
      526,
      "#2358b4"
    ],
    [
      528,
      "#1e66bb"
    ],
    [
      530,
      "#1974c3"
    ],
    [
      532,
      "#1481c9"
    ],
    [
      534,
      "#0f8fd1"
    ],
    [
      536,
      "#0b9ad6"
    ],
    [
      538,
      "#06a7dd"
    ],
    [
      540,
      "#007930"
    ],
    [
      542,
      "#268b38"
    ],
    [
      544,
      "#4d9f40"
    ],
    [
      546,
      "#70b24a"
    ],
    [
      548,
      "#82ca5c"
    ],
    [
      550,
      "#93e16e"
    ],
    [
      552,
      "#f4f569"
    ],
    [
      554,
      "#f5e756"
    ],
    [
      556,
      "#f6d944"
    ],
    [
      558,
      "#f8cb32"
    ],
    [
      560,
      "#f9bd1f"
    ],
    [
      562,
      "#faaf0d"
    ],
    [
      564,
      "#fb9e00"
    ],
    [
      566,
      "#f98200"
    ],
    [
      568,
      "#f76c00"
    ],
    [
      570,
      "#f54f00"
    ],
    [
      572,
      "#f33300"
    ],
    [
      574,
      "#f11700"
    ],
    [
      576,
      "#f00000"
    ],
    [
      578,
      "#e20000"
    ],
    [
      580,
      "#d40000"
    ],
    [
      582,
      "#c70000"
    ],
    [
      584,
      "#ba0000"
    ],
    [
      586,
      "#790000"
    ],
    [
      588,
      "#860000"
    ],
    [
      590,
      "#6f0000"
    ],
    [
      592,
      "#550000"
    ],
    [
      594,
      "#400000"
    ],
    [
      596,
      "#280000"
    ],
    [
      598,
      "#110000"
    ],
    [
      600,
      "#000000"
    ]
  ]
};
function contourColor(field, value) {
  const stops = CONTOUR_PALETTES[field];
  if (!stops || !Number.isFinite(value)) throw Error('Unknown contour color');
  let selected = stops[0][1];
  for (const [threshold, color] of stops) { if (value < threshold) break; selected = color; }
  return selected;
}

function worldCopies(west, east) {
  if (![west, east].every(Number.isFinite) || east < west) return [];
  const middle = Math.floor(((west + east) / 2 + 180) / 360);
  const lo = Math.max(middle - 3, Math.floor((west + 180) / 360) - 1);
  const hi = Math.min(middle + 3, Math.floor((east + 180) / 360) + 1);
  return Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => (lo + i) * 360);
}

const PRESSURE_LEVELS = [925, 850, 700, 500, 300];
const CONTOUR_FIELDS = {
  gh: { label: 'Geopotential height', units: 'dam', steps: [3, 6, 12], bounds: [-100, 6000] },
  temp: { label: 'Temperature', units: 'degC', steps: [2, 4, 8], bounds: [-173.2, 126.9] },
};
function defaultContours() {
  return { labels: true, gh: { on: false, level: 500, step: 6,  },
    temp: { on: false, level: 850, step: 4,  } };
}
function safeContourOptions(raw) {
  const result = defaultContours(); if (!raw) return result;
  result.labels = raw.labels !== false;
  for (const key of Object.keys(CONTOUR_FIELDS)) {
    const p = raw[key]; if (!p) continue;
    result[key].on = p.on === true;
    if (PRESSURE_LEVELS.includes(p.level)) result[key].level = p.level;
    if (CONTOUR_FIELDS[key].steps.includes(p.step)) result[key].step = p.step;
  }
  return result;
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
    for (let y = 0; y < h - 1; y++) for (let x = 0; x < (grid.periodic === false ? w - 1 : w); x++) {
      const next = (x + 1) % w;
      const v = [values[y*w+x], values[y*w+next], values[(y+1)*w+next], values[(y+1)*w+x]];
      if (v.some(a => !Number.isFinite(a))) continue;
      const mask = v.reduce((m, a, i) => m | (a >= level ? 1 << i : 0), 0);
      if (!mask || mask === 15) continue;
      const pairs = mask === 5 || mask === 10 ? ((v[0]-level)*(v[2]-level)-(v[1]-level)*(v[3]-level) >= 0 ? [[0,1],[2,3]] : [[3,0],[1,2]]) : table[mask];
      const positions = [[x0+x*d,y0+y*(grid.latitudeStep ?? d)],[x0+(x+1)*d,y0+y*(grid.latitudeStep ?? d)],[x0+(x+1)*d,y0+(y+1)*(grid.latitudeStep ?? d)],[x0+x*d,y0+(y+1)*(grid.latitudeStep ?? d)]];
      const cross = edge => { const a = edge, b = (edge + 1) % 4, f = (level - v[a]) / (v[b] - v[a]); return [positions[a][0] + f * (positions[b][0]-positions[a][0]), positions[a][1] + f * (positions[b][1]-positions[a][1])]; };
      for (const [a,b] of pairs) { const p = cross(a), q = cross(b); if (p.every(Number.isFinite) && q.every(Number.isFinite) && Math.hypot(p[0]-q[0],p[1]-q[1]) > 1e-9) segments.push([p[0],p[1],q[0],q[1],level]); }
    }
  }
  return segments;
}
function contourHalo(color) {
  const rgb = [1,3,5].map(i => parseInt(color.slice(i,i+2),16));
  return rgb[0]*.2126 + rgb[1]*.7152 + rgb[2]*.0722 < 85 ? '#e8eef4' : '#102131';
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
    const groups = new Map();
    for (const segment of visible) {
      const value = segment[2]; if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(segment);
    }
    ctx.lineJoin = 'round'; ctx.setLineDash(layer.field === 'temp' ? [5,3] : []);
    for (const [value, segments] of groups) {
      const color = contourColor(layer.field, value);
      ctx.beginPath(); for (const [a,b] of segments) { ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
      ctx.strokeStyle = contourHalo(color); ctx.lineWidth = 3.8; ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = layer.field === 'gh' ? 1.8 : 1.3; ctx.stroke();
    }
    ctx.setLineDash([]);
    labelGroups.push({ layer, config, visible });
  }
  if (options.labels) {
    for (const { layer, config, visible } of labelGroups) {
      ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const [a,b,level] of visible) {
        const x=(a.x+b.x)/2, y=(a.y+b.y)/2;
        if (x<45 || x>width-45 || y<18 || y>height-18) continue;
        const cell = layer.field+':'+Math.floor(x/135)+':'+Math.floor(y/65); if (occupied.has(cell)) continue;
        const label = `${layer.level}h ${level}${layer.field === 'gh' ? ' dam' : '\u00b0C'}`;
        const half=(ctx.measureText?.(label).width || label.length*6)/2;
        if(boxes.some(b=>Math.abs(b.x-x)<b.half+half+5 && Math.abs(b.y-y)<19)) continue;
        occupied.add(cell); boxes.push({x,y,half});
        const color = contourColor(layer.field, level);
        ctx.strokeStyle = contourHalo(color); ctx.lineWidth = 3.5; ctx.strokeText(label,x,y); ctx.fillStyle=color; ctx.fillText(label,x,y);
      }
    }
  }
  ctx.setLineDash([]);
}
class ContourOverlay {
  constructor({ map, provider, onChange = () => {}, onRender = () => {} }) {
    this.map=map; this.provider=provider; this.onChange=onChange; this.onRender=onRender;
    this.layers=[]; this.epoch=0; this.dead=false; this.signature=''; this.options=defaultContours();
    this.canvas=document.createElement('canvas'); this.canvas.dataset.synopticContours='map'; this.canvas.setAttribute('aria-hidden','true');
    Object.assign(this.canvas.style,{position:'absolute',left:'0',top:'0',pointerEvents:'none',zIndex:'0'});
    const surface=map.getContainer().querySelector('.maplibregl-canvas-container') || map.getContainer();
    surface.appendChild(this.canvas);
  }
  set(options, timestamp, enabled, product) {
    const safe=safeContourOptions(options), signature=JSON.stringify([safe,timestamp,enabled,product]);
    if(this.dead || signature===this.signature) return;
    this.signature=signature; this.options=safe; this.timestamp=timestamp; this.enabled=enabled; this.product=product;
    this.epoch++; this.abort?.abort(); clearTimeout(this.timer); this.layers=[]; this.onRender();
    const fields=Object.keys(CONTOUR_FIELDS).filter(k=>safe[k].on);
    if(!enabled || !fields.length) { this.onChange({loading:false,errors:[],active:[]}); return; }
    this.onChange({loading:true,errors:[],active:[]});
    this.timer=setTimeout(()=>void this.load(fields,this.epoch),180);
  }
  async load(fields, epoch) {
    const abort=new AbortController(); this.abort=abort;
    const timeout=setTimeout(()=>abort.abort(),30000), errors=[];
    try {
      await Promise.all(fields.map(async field=>{
        const config=this.options[field];
        try {
          const result=await this.provider.load({map:this.map,product:this.product,timestamp:this.timestamp,field,level:config.level,abort});
          if(this.dead || epoch!==this.epoch || abort.signal.aborted) return;
          const segments=contourSegments(result.values,result.grid,config.step);
          this.validTime=result.validTime;
          this.layers.push({field,level:config.level,segments});
          this.layers.sort((a,b)=>Object.keys(CONTOUR_FIELDS).indexOf(a.field)-Object.keys(CONTOUR_FIELDS).indexOf(b.field));
          this.onRender();
        } catch(error) {
          if(epoch===this.epoch) errors.push(CONTOUR_FIELDS[field].label+': '+(abort.signal.aborted?'request timed out':error.message));
        }
      }));
      if(!this.dead && epoch===this.epoch) this.onChange({loading:false,errors,active:this.layers.map(l=>l.field),validTime:this.validTime,product:this.product});
    } finally { clearTimeout(timeout); }
  }
  paint() {
    if(this.dead) return;
    const size=this.map.getSize(), ratio=Math.min(window.devicePixelRatio||1,2), c=this.canvas;
    if(c.width!==Math.round(size.x*ratio) || c.height!==Math.round(size.y*ratio)) { c.width=Math.round(size.x*ratio); c.height=Math.round(size.y*ratio); }
    c.style.width=size.x+'px'; c.style.height=size.y+'px'; const ctx=c.getContext('2d'); if(!ctx) return;
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const shown=this.enabled?this.layers:[];
    c.dataset.layers=shown.map(l=>l.field+':'+l.level).sort().join(',');
    c.dataset.product=this.product || '';
    drawContours(ctx,this.map,shown,this.options,size.x,size.y);
  }
  refresh() { this.signature=''; this.set(this.options,this.timestamp,this.enabled,this.product); }
  destroy() { this.dead=true; this.epoch++; this.abort?.abort(); clearTimeout(this.timer); this.layers=[]; this.provider?.destroy(); this.canvas.remove(); }
}

// Use Windy's native below-timeline slot on phones; preserve the desktop portal.
function mountControllerDock(controls) {
  // Stop timeline/map gesture handlers without cancelling native taps or scrolling.
  const inputEvents = ['pointerdown','pointermove','pointerup','pointercancel','touchstart','touchmove','touchend','touchcancel','mousedown','mouseup','click','dblclick','contextmenu','wheel','keydown','keyup'];
  const stopInput = event => event.stopPropagation();
  for (const type of inputEvents) controls.addEventListener(type, stopInput, { passive: true });
  controls.style.setProperty('pointer-events', 'auto', 'important');
  const mobile = window.matchMedia('(max-width:600px)');
  // Capture only this plugin's original host before portalling the controls.
  const originalParent = controls.parentElement;
  const nativeHost = originalParent?.closest('[id="windy-plugin-synoptic-atlas"],[id="plugin-windy-plugin-synoptic-atlas"],[data-plugin="windy-plugin-synoptic-atlas"]') || originalParent;
  const safeHost = nativeHost && nativeHost !== document.body && nativeHost !== document.documentElement && nativeHost.id !== 'bottom-wrapper' && nativeHost.id !== 'leaflet-map' ? nativeHost : null;
  const originalDisplay = safeHost?.style.getPropertyValue('display') || '';
  const originalPriority = safeHost?.style.getPropertyPriority('display') || '';
  function restoreHost() {
    if (!safeHost) return;
    if (originalDisplay) safeHost.style.setProperty('display', originalDisplay, originalPriority);
    else safeHost.style.removeProperty('display');
  }
  let frame = 0, dead = false;
  function place() {
    frame = 0; if (dead) return;
    if (safeHost) {
      if (!mobile.matches) safeHost.style.setProperty('display', 'none', 'important');
      else restoreHost();
    }
    const host = mobile.matches ? document.querySelector('#bottom-wrapper') : null;
    const slot = host?.querySelector('[data-plugin="bottom-below-controls-mobile"]');
    const parent = host || document.body;
    controls.classList.toggle('mobile-docked', !!host);
    if (slot) {
      if (controls.parentElement !== parent || slot.nextElementSibling !== controls) slot.insertAdjacentElement('afterend', controls);
    } else if (controls.parentElement !== parent) parent.appendChild(controls);
  }
  function schedule() { if (!dead && !frame) frame = requestAnimationFrame(place); }
  const observer = new MutationObserver(schedule);
  place();
  observer.observe(document.body, { childList: true, subtree: true });
  mobile.addEventListener('change', schedule);
  return () => {
    restoreHost();
    for (const type of inputEvents) controls.removeEventListener(type, stopInput);
    dead = true; observer.disconnect(); mobile.removeEventListener('change', schedule);
    if (frame) cancelAnimationFrame(frame);
  };
}

/* src/pluginEntry.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-8zof97", ".atlas-controls.svelte-8zof97.svelte-8zof97{position:fixed;left:12px;bottom:95px;z-index:10000;isolation:isolate;pointer-events:auto;width:280px;max-width:calc(100vw - 24px);font:12px/1.4 system-ui,sans-serif;color:#f0f5f8}.panel.svelte-8zof97.svelte-8zof97,.restore.svelte-8zof97.svelte-8zof97{background:#142536;border:1px solid #526879;border-radius:12px;box-shadow:0 5px 20px #0005}.panel.svelte-8zof97.svelte-8zof97{padding:12px;max-height:calc(100dvh - 180px);overflow:auto;box-sizing:border-box}header.svelte-8zof97.svelte-8zof97{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}header.svelte-8zof97 strong.svelte-8zof97{font-size:17px}.panel-actions.svelte-8zof97.svelte-8zof97{display:flex;gap:5px}.restore.svelte-8zof97.svelte-8zof97{padding:10px}button.svelte-8zof97.svelte-8zof97,select.svelte-8zof97.svelte-8zof97,input.svelte-8zof97.svelte-8zof97{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:6px;padding:5px 7px}button.svelte-8zof97.svelte-8zof97,select.svelte-8zof97.svelte-8zof97,summary.svelte-8zof97.svelte-8zof97{cursor:pointer}button.svelte-8zof97.svelte-8zof97:disabled,select.svelte-8zof97.svelte-8zof97:disabled{opacity:.5;cursor:default}button.svelte-8zof97.svelte-8zof97:focus-visible,select.svelte-8zof97.svelte-8zof97:focus-visible,input.svelte-8zof97.svelte-8zof97:focus-visible,summary.svelte-8zof97.svelte-8zof97:focus-visible{outline:2px solid #ffd166;outline-offset:2px}input[type=checkbox].svelte-8zof97.svelte-8zof97{accent-color:#ffd166;width:15px;height:15px;margin:0}.row.svelte-8zof97.svelte-8zof97{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0}.row.svelte-8zof97 label.svelte-8zof97{font-size:12px}label.svelte-8zof97.svelte-8zof97{display:flex;align-items:center;gap:7px}.row.svelte-8zof97 select.svelte-8zof97{font-size:11px;min-width:88px}.stamp.svelte-8zof97.svelte-8zof97{font-size:11px;color:#bdccd9;margin:8px 0}.error.svelte-8zof97.svelte-8zof97{background:#692f30;padding:8px;border-radius:6px;font-size:11px}p[role=status].svelte-8zof97.svelte-8zof97{font-size:11px}.more.svelte-8zof97.svelte-8zof97{border-top:1px solid #42586b;margin-top:8px;padding-top:8px}summary.svelte-8zof97.svelte-8zof97{font-size:11px}.toolbar.svelte-8zof97.svelte-8zof97,.switches.svelte-8zof97.svelte-8zof97{display:flex;gap:8px;align-items:center;margin:10px 0}.switches.svelte-8zof97 button.svelte-8zof97{margin-left:auto}button.svelte-8zof97.svelte-8zof97{font-size:11px}.spacing.svelte-8zof97.svelte-8zof97{justify-content:space-between;margin:10px 0;font-size:11px}small.svelte-8zof97.svelte-8zof97{display:block;font-size:10px;color:#bbcad6;margin-top:10px}@media(max-width:600px){.atlas-controls.svelte-8zof97.svelte-8zof97{left:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));width:calc(100vw - 16px);max-width:none}.atlas-controls.svelte-8zof97.svelte-8zof97.mobile-docked{position:relative;left:auto;bottom:auto;width:auto;margin:4px 8px calc(8px + env(safe-area-inset-bottom,0px));max-width:none}.panel.svelte-8zof97.svelte-8zof97{padding:8px 10px;max-height:50dvh;border-radius:9px}header.svelte-8zof97.svelte-8zof97{margin-bottom:2px}header.svelte-8zof97 strong.svelte-8zof97{font-size:14px}.row.svelte-8zof97.svelte-8zof97{padding:2px 0}.row.svelte-8zof97 label.svelte-8zof97{min-height:44px;font-size:13px;flex:1}.row.svelte-8zof97 select.svelte-8zof97{min-height:44px;min-width:108px;font-size:16px}input[type=checkbox].svelte-8zof97.svelte-8zof97{width:22px;height:22px;flex-shrink:0}button.svelte-8zof97.svelte-8zof97,select.svelte-8zof97.svelte-8zof97,label.svelte-8zof97.svelte-8zof97,summary.svelte-8zof97.svelte-8zof97{pointer-events:auto;touch-action:manipulation}button.svelte-8zof97.svelte-8zof97,summary.svelte-8zof97.svelte-8zof97{min-height:44px;box-sizing:border-box}button.svelte-8zof97.svelte-8zof97{font-size:13px}header.svelte-8zof97 button.svelte-8zof97{min-width:44px}.switches.svelte-8zof97 label.svelte-8zof97{min-height:44px}.spacing.svelte-8zof97 select.svelte-8zof97{min-height:44px;font-size:16px}.panel.svelte-8zof97.svelte-8zof97{touch-action:pan-y;overscroll-behavior:contain}label.svelte-8zof97.svelte-8zof97,button.svelte-8zof97.svelte-8zof97,summary.svelte-8zof97.svelte-8zof97{-webkit-user-select:none;user-select:none}.stamp.svelte-8zof97.svelte-8zof97{display:inline-block;margin:4px 0;font-size:10px}.more.svelte-8zof97.svelte-8zof97{margin-top:4px;padding-top:4px}summary.svelte-8zof97.svelte-8zof97{font-size:11px}.restore.svelte-8zof97.svelte-8zof97{padding:8px 10px}}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[33] = list[i];
	child_ctx[34] = list;
	child_ctx[35] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[36] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[39] = list[i];
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[33] = list[i];
	child_ctx[42] = list;
	child_ctx[43] = i;
	return child_ctx;
}

function get_each_context_4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[44] = list[i];
	return child_ctx;
}

// (85:0) {:else}
function create_else_block(ctx) {
	let section;
	let header;
	let strong;
	let div0;
	let button0;
	let button1;
	let t3;
	let t4;
	let p;
	let t5;
	let t6_value = (/*product*/ ctx[3].toUpperCase() || 'Unavailable') + "";
	let t6;
	let t7;
	let t8;
	let t9;
	let t10;
	let details;
	let summary;
	let t12;
	let div1;
	let button2;
	let t13;
	let button2_disabled_value;
	let button3;
	let t15;
	let div2;
	let label0;
	let input0;
	let t16;
	let label1;
	let input1;
	let t17;
	let button4;
	let t18;
	let button4_disabled_value;
	let t19;
	let t20;
	let small;
	let mounted;
	let dispose;
	let each_value_3 = ensure_array_like(Object.keys(CONTOUR_FIELDS));
	let each_blocks_2 = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	let if_block0 = /*status*/ ctx[6].loading && create_if_block_2();
	let each_value_2 = ensure_array_like(/*status*/ ctx[6].errors);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	let if_block1 = /*status*/ ctx[6].validTime && /*status*/ ctx[6].active.length && create_if_block_1(ctx);
	let each_value = ensure_array_like(Object.keys(CONTOUR_FIELDS));
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			section = element("section");
			header = element("header");
			strong = element("strong");
			strong.textContent = `${config.title}`;
			div0 = element("div");
			button0 = element("button");
			button0.textContent = "−";
			button1 = element("button");
			button1.textContent = "×";
			t3 = space();

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].c();
			}

			t4 = space();
			p = element("p");
			t5 = text("Model: ");
			t6 = text(t6_value);
			t7 = space();
			if (if_block0) if_block0.c();
			t8 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t9 = space();
			if (if_block1) if_block1.c();
			t10 = space();
			details = element("details");
			summary = element("summary");
			summary.textContent = "More";
			t12 = space();
			div1 = element("div");
			button2 = element("button");
			t13 = text("Synoptic preset");
			button3 = element("button");
			button3.textContent = "Clear all";
			t15 = space();
			div2 = element("div");
			label0 = element("label");
			input0 = element("input");
			t16 = text("On");
			label1 = element("label");
			input1 = element("input");
			t17 = text("Labels");
			button4 = element("button");
			t18 = text("Refresh");
			t19 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t20 = space();
			small = element("small");
			small.textContent = "Follows Windy’s selected model and available forecast range. Times use your device timezone. Height in dam; temperature in °C.";
			attr(strong, "class", "svelte-8zof97");
			attr(button0, "aria-label", "Minimize panel");
			attr(button0, "class", "svelte-8zof97");
			attr(button1, "aria-label", "Close plugin");
			attr(button1, "title", "Close Synoptic Atlas");
			attr(button1, "class", "svelte-8zof97");
			attr(div0, "class", "panel-actions svelte-8zof97");
			attr(header, "class", "svelte-8zof97");
			attr(p, "class", "stamp svelte-8zof97");
			attr(p, "data-testid", "contour-model");
			attr(summary, "class", "svelte-8zof97");
			button2.disabled = button2_disabled_value = !/*enabled*/ ctx[2];
			attr(button2, "class", "svelte-8zof97");
			attr(button3, "class", "svelte-8zof97");
			attr(div1, "class", "toolbar svelte-8zof97");
			attr(input0, "aria-label", "Enable isolines");
			attr(input0, "type", "checkbox");
			attr(input0, "class", "svelte-8zof97");
			attr(label0, "class", "svelte-8zof97");
			attr(input1, "aria-label", "Contour labels");
			attr(input1, "type", "checkbox");
			attr(input1, "class", "svelte-8zof97");
			attr(label1, "class", "svelte-8zof97");
			button4.disabled = button4_disabled_value = !/*enabled*/ ctx[2] || /*status*/ ctx[6].loading;
			attr(button4, "class", "svelte-8zof97");
			attr(div2, "class", "switches svelte-8zof97");
			attr(small, "class", "svelte-8zof97");
			attr(details, "class", "more svelte-8zof97");
			attr(section, "class", "panel svelte-8zof97");
			attr(section, "aria-label", "Synoptic Atlas");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, header);
			append(header, strong);
			append(header, div0);
			append(div0, button0);
			append(div0, button1);
			append(section, t3);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				if (each_blocks_2[i]) {
					each_blocks_2[i].m(section, null);
				}
			}

			append(section, t4);
			append(section, p);
			append(p, t5);
			append(p, t6);
			append(section, t7);
			if (if_block0) if_block0.m(section, null);
			append(section, t8);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				if (each_blocks_1[i]) {
					each_blocks_1[i].m(section, null);
				}
			}

			append(section, t9);
			if (if_block1) if_block1.m(section, null);
			append(section, t10);
			append(section, details);
			append(details, summary);
			append(details, t12);
			append(details, div1);
			append(div1, button2);
			append(button2, t13);
			append(div1, button3);
			append(details, t15);
			append(details, div2);
			append(div2, label0);
			append(label0, input0);
			input0.checked = /*enabled*/ ctx[2];
			append(label0, t16);
			append(div2, label1);
			append(label1, input1);
			input1.checked = /*options*/ ctx[0].labels;
			append(label1, t17);
			append(div2, button4);
			append(button4, t18);
			append(details, t19);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(details, null);
				}
			}

			append(details, t20);
			append(details, small);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler_1*/ ctx[15]),
					listen(button1, "click", /*closePlugin*/ ctx[9]),
					listen(button2, "click", /*preset*/ ctx[10]),
					listen(button3, "click", /*clear*/ ctx[11]),
					listen(input0, "change", /*input0_change_handler*/ ctx[18]),
					listen(input1, "change", /*input1_change_handler*/ ctx[19]),
					listen(input1, "change", /*save*/ ctx[8]),
					listen(button4, "click", /*click_handler_2*/ ctx[20])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*enabled, options, save*/ 261) {
				each_value_3 = ensure_array_like(Object.keys(CONTOUR_FIELDS));
				let i;

				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3(ctx, each_value_3, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(child_ctx, dirty);
					} else {
						each_blocks_2[i] = create_each_block_3(child_ctx);
						each_blocks_2[i].c();
						each_blocks_2[i].m(section, t4);
					}
				}

				for (; i < each_blocks_2.length; i += 1) {
					each_blocks_2[i].d(1);
				}

				each_blocks_2.length = each_value_3.length;
			}

			if (dirty[0] & /*product*/ 8 && t6_value !== (t6_value = (/*product*/ ctx[3].toUpperCase() || 'Unavailable') + "")) set_data(t6, t6_value);

			if (/*status*/ ctx[6].loading) {
				if (if_block0) ; else {
					if_block0 = create_if_block_2();
					if_block0.c();
					if_block0.m(section, t8);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*status*/ 64) {
				each_value_2 = ensure_array_like(/*status*/ ctx[6].errors);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_2(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(section, t9);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_2.length;
			}

			if (/*status*/ ctx[6].validTime && /*status*/ ctx[6].active.length) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_1(ctx);
					if_block1.c();
					if_block1.m(section, t10);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*enabled*/ 4 && button2_disabled_value !== (button2_disabled_value = !/*enabled*/ ctx[2])) {
				button2.disabled = button2_disabled_value;
			}

			if (dirty[0] & /*enabled*/ 4) {
				input0.checked = /*enabled*/ ctx[2];
			}

			if (dirty[0] & /*options*/ 1) {
				input1.checked = /*options*/ ctx[0].labels;
			}

			if (dirty[0] & /*enabled, status*/ 68 && button4_disabled_value !== (button4_disabled_value = !/*enabled*/ ctx[2] || /*status*/ ctx[6].loading)) {
				button4.disabled = button4_disabled_value;
			}

			if (dirty[0] & /*enabled, options, save*/ 261) {
				each_value = ensure_array_like(Object.keys(CONTOUR_FIELDS));
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(details, t20);
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
				detach(section);
			}

			destroy_each(each_blocks_2, detaching);
			if (if_block0) if_block0.d();
			destroy_each(each_blocks_1, detaching);
			if (if_block1) if_block1.d();
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (83:0) {#if hidden}
function create_if_block(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "Synoptic Atlas";
			attr(button, "class", "restore svelte-8zof97");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[14]);
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

// (91:144) {#each PRESSURE_LEVELS as level}
function create_each_block_4(ctx) {
	let option;

	return {
		c() {
			option = element("option");
			option.textContent = `${/*level*/ ctx[44]} hPa`;
			option.__value = /*level*/ ctx[44];
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

// (88:4) {#each Object.keys(CONTOUR_FIELDS) as key}
function create_each_block_3(ctx) {
	let div;
	let label;
	let input;
	let input_disabled_value;
	let span;
	let t1;
	let select;
	let select_disabled_value;
	let mounted;
	let dispose;

	function input_change_handler() {
		/*input_change_handler*/ ctx[16].call(input, /*key*/ ctx[33]);
	}

	let each_value_4 = ensure_array_like(PRESSURE_LEVELS);
	let each_blocks = [];

	for (let i = 0; i < each_value_4.length; i += 1) {
		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
	}

	function select_change_handler() {
		/*select_change_handler*/ ctx[17].call(select, /*key*/ ctx[33]);
	}

	return {
		c() {
			div = element("div");
			label = element("label");
			input = element("input");
			span = element("span");

			span.textContent = `${/*key*/ ctx[33] === 'gh'
			? 'Geopotential'
			: 'Temperature'}`;

			t1 = space();
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(input, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[33]].label + ' isolines');
			attr(input, "type", "checkbox");
			input.disabled = input_disabled_value = !/*enabled*/ ctx[2];
			attr(input, "class", "svelte-8zof97");
			attr(label, "class", "svelte-8zof97");
			attr(select, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[33]].label + ' pressure level');
			select.disabled = select_disabled_value = !/*enabled*/ ctx[2];
			attr(select, "class", "svelte-8zof97");
			if (/*options*/ ctx[0][/*key*/ ctx[33]].level === void 0) add_render_callback(select_change_handler);
			attr(div, "class", "row svelte-8zof97");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, label);
			append(label, input);
			input.checked = /*options*/ ctx[0][/*key*/ ctx[33]].on;
			append(label, span);
			append(div, t1);
			append(div, select);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*options*/ ctx[0][/*key*/ ctx[33]].level, true);

			if (!mounted) {
				dispose = [
					listen(input, "change", input_change_handler),
					listen(input, "change", /*save*/ ctx[8]),
					listen(select, "change", select_change_handler),
					listen(select, "change", /*save*/ ctx[8])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*enabled*/ 4 && input_disabled_value !== (input_disabled_value = !/*enabled*/ ctx[2])) {
				input.disabled = input_disabled_value;
			}

			if (dirty[0] & /*options*/ 1) {
				input.checked = /*options*/ ctx[0][/*key*/ ctx[33]].on;
			}

			if (dirty[0] & /*enabled*/ 4 && select_disabled_value !== (select_disabled_value = !/*enabled*/ ctx[2])) {
				select.disabled = select_disabled_value;
			}

			if (dirty[0] & /*options*/ 1) {
				select_option(select, /*options*/ ctx[0][/*key*/ ctx[33]].level);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (95:4) {#if status.loading}
function create_if_block_2(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "Loading contours…";
			attr(p, "role", "status");
			attr(p, "class", "svelte-8zof97");
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

// (96:4) {#each status.errors as message}
function create_each_block_2(ctx) {
	let p;
	let t_value = /*message*/ ctx[39] + "";
	let t;

	return {
		c() {
			p = element("p");
			t = text(t_value);
			attr(p, "class", "error svelte-8zof97");
			attr(p, "role", "alert");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*status*/ 64 && t_value !== (t_value = /*message*/ ctx[39] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (97:4) {#if status.validTime && status.active.length}
function create_if_block_1(ctx) {
	let p;
	let t0;
	let t1_value = /*displayTime*/ ctx[7](/*status*/ ctx[6].validTime) + "";
	let t1;

	return {
		c() {
			p = element("p");
			t0 = text("Valid ");
			t1 = text(t1_value);
			attr(p, "class", "stamp svelte-8zof97");
			attr(p, "data-testid", "contour-time");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t0);
			append(p, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*status*/ 64 && t1_value !== (t1_value = /*displayTime*/ ctx[7](/*status*/ ctx[6].validTime) + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (102:226) {#each CONTOUR_FIELDS[key].steps as step}
function create_each_block_1(ctx) {
	let option;
	let t0_value = /*step*/ ctx[36] + "";
	let t0;
	let t1;
	let t2_value = (/*key*/ ctx[33] === 'temp' ? '°C' : 'dam') + "";
	let t2;

	return {
		c() {
			option = element("option");
			t0 = text(t0_value);
			t1 = space();
			t2 = text(t2_value);
			option.__value = /*step*/ ctx[36];
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

// (101:6) {#each Object.keys(CONTOUR_FIELDS) as key}
function create_each_block(ctx) {
	let label;

	let t_value = (/*key*/ ctx[33] === 'gh'
	? 'Height interval'
	: 'Temperature interval') + "";

	let t;
	let select;
	let select_disabled_value;
	let mounted;
	let dispose;
	let each_value_1 = ensure_array_like(CONTOUR_FIELDS[/*key*/ ctx[33]].steps);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	function select_change_handler_1() {
		/*select_change_handler_1*/ ctx[21].call(select, /*key*/ ctx[33]);
	}

	return {
		c() {
			label = element("label");
			t = text(t_value);
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(select, "aria-label", CONTOUR_FIELDS[/*key*/ ctx[33]].label + ' contour spacing');
			select.disabled = select_disabled_value = !/*enabled*/ ctx[2];
			attr(select, "class", "svelte-8zof97");
			if (/*options*/ ctx[0][/*key*/ ctx[33]].step === void 0) add_render_callback(select_change_handler_1);
			attr(label, "class", "spacing svelte-8zof97");
		},
		m(target, anchor) {
			insert(target, label, anchor);
			append(label, t);
			append(label, select);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(select, null);
				}
			}

			select_option(select, /*options*/ ctx[0][/*key*/ ctx[33]].step, true);

			if (!mounted) {
				dispose = [
					listen(select, "change", select_change_handler_1),
					listen(select, "change", /*save*/ ctx[8])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty & /*Object*/ 0) {
				each_value_1 = ensure_array_like(CONTOUR_FIELDS[/*key*/ ctx[33]].steps);
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

			if (dirty[0] & /*enabled*/ 4 && select_disabled_value !== (select_disabled_value = !/*enabled*/ ctx[2])) {
				select.disabled = select_disabled_value;
			}

			if (dirty[0] & /*options*/ 1) {
				select_option(select, /*options*/ ctx[0][/*key*/ ctx[33]].step);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(label);
			}

			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment(ctx) {
	let div;

	function select_block_type(ctx, dirty) {
		if (/*hidden*/ ctx[5]) return create_if_block;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "atlas-controls svelte-8zof97");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
			/*div_binding*/ ctx[22](div);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if_block.d();
			/*div_binding*/ ctx[22](null);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let releaseDock = () => {
		
	};

	let controls;

	let options = defaultContours(),
		layer = null,
		enabled = true,
		hidden = false,
		destroyed = false;

	let product = '',
		timestamp = Date.now(),
		status = { loading: false, errors: [], active: [] };

	let listener, modelListener, timer, clock, animation = 0, observer = null;

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

	function closePlugin() {
		broadcast.emit('rqstClose', config.name);
	}

	function preset() {
		$$invalidate(0, options = {
			...options,
			gh: { ...options.gh, on: true, level: 500 },
			temp: { ...options.temp, on: true, level: 850 }
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

	function refreshViewport() {
		layer?.refresh();
	}

	function render() {
		if (destroyed || animation) return;

		animation = requestAnimationFrame(() => {
			animation = 0;
			layer?.paint();
		});
	}

	const onopen = () => {
		$$invalidate(5, hidden = false);
	};

	onMount(() => {
		releaseDock = mountControllerDock(controls);

		try {
			$$invalidate(0, options = safeContourOptions(JSON.parse(localStorage.getItem('synoptic-atlas.options.v1') || 'null')));
		} catch {
			
		}

		$$invalidate(13, timestamp = Number(store.get('timestamp')) || Date.now());
		$$invalidate(3, product = String(store.get('product') || ''));

		$$invalidate(1, layer = new ContourOverlay({
				map,
				provider: createWindyContourProvider(),
				onChange: value => {
					$$invalidate(6, status = value);
				},
				onRender: render
			}));

		listener = store.on('timestamp', () => {
			$$invalidate(13, timestamp = Number(store.get('timestamp')));
		});

		modelListener = store.on('product', () => {
			$$invalidate(3, product = String(store.get('product') || ''));
		});

		map.on('moveend', refreshViewport);
		map.on('zoomend', refreshViewport);
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
		releaseDock();
		controls?.remove();
		destroyed = true;
		layer?.destroy();
		$$invalidate(1, layer = null);
		if (animation) cancelAnimationFrame(animation);
		clearInterval(timer);
		clearInterval(clock);
		observer?.disconnect();
		map.off('moveend', refreshViewport);
		map.off('zoomend', refreshViewport);
		map.off('move', render);
		map.off('zoom', render);
		map.off('resize', render);
		if (listener != null) store.off(listener);
		if (modelListener != null) store.off(modelListener);
	});

	const click_handler = () => $$invalidate(5, hidden = false);
	const click_handler_1 = () => $$invalidate(5, hidden = true);

	function input_change_handler(key) {
		options[key].on = this.checked;
		$$invalidate(0, options);
	}

	function select_change_handler(key) {
		options[key].level = select_value(this);
		$$invalidate(0, options);
	}

	function input0_change_handler() {
		enabled = this.checked;
		$$invalidate(2, enabled);
	}

	function input1_change_handler() {
		options.labels = this.checked;
		$$invalidate(0, options);
	}

	const click_handler_2 = () => layer?.refresh();

	function select_change_handler_1(key) {
		options[key].step = select_value(this);
		$$invalidate(0, options);
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			controls = $$value;
			$$invalidate(4, controls);
		});
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*layer, options, timestamp, enabled, product*/ 8207) {
			if (layer) layer.set(options, timestamp, enabled, product);
		}
	};

	return [
		options,
		layer,
		enabled,
		product,
		controls,
		hidden,
		status,
		displayTime,
		save,
		closePlugin,
		preset,
		clear,
		onopen,
		timestamp,
		click_handler,
		click_handler_1,
		input_change_handler,
		select_change_handler,
		input0_change_handler,
		input1_change_handler,
		click_handler_2,
		select_change_handler_1,
		div_binding
	];
}

class PluginEntry extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onopen: 12 }, add_css, [-1, -1]);
	}

	get onopen() {
		return this.$$.ctx[12];
	}
}


// transformCode: Export statement was modified
export { __pluginConfig, PluginEntry as default };
//# sourceMappingURL=plugin.js.map
