(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.ProgressBar = factory());
}(this, function () { 'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = cb => requestAnimationFrame(cb);

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        const invalidators = [];
        const store = readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                run_all(invalidators);
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
        return {
            subscribe(run, invalidate = noop) {
                invalidators.push(invalidate);
                const unsubscribe = store.subscribe(run, invalidate);
                return () => {
                    const index = invalidators.indexOf(invalidate);
                    if (index !== -1) {
                        invalidators.splice(index, 1);
                    }
                    unsubscribe();
                };
            }
        };
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/Arc.svelte generated by Svelte v3.6.7 */

    function create_fragment(ctx) {
    	var path, path_d_value;

    	return {
    		c() {
    			path = svg_element("path");
    			attr(path, "d", path_d_value = describeArc(50, 50, 49.5 - ctx.thickness / 2, ctx.$prevOffset, ctx.$offset));
    			attr(path, "fill", "transparent");
    			attr(path, "stroke", ctx.color);
    			attr(path, "stroke-width", ctx.thickness);
    		},

    		m(target, anchor) {
    			insert(target, path, anchor);
    		},

    		p(changed, ctx) {
    			if ((changed.thickness || changed.$prevOffset || changed.$offset) && path_d_value !== (path_d_value = describeArc(50, 50, 49.5 - ctx.thickness / 2, ctx.$prevOffset, ctx.$offset))) {
    				attr(path, "d", path_d_value);
    			}

    			if (changed.color) {
    				attr(path, "stroke", ctx.color);
    			}

    			if (changed.thickness) {
    				attr(path, "stroke-width", ctx.thickness);
    			}
    		},

    		i: noop,
    		o: noop,

    		d(detaching) {
    			if (detaching) {
    				detach(path);
    			}
    		}
    	};
    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    	angleInDegrees = angleInDegrees % 360;
    	const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    	return {
    		x: centerX + (radius * Math.cos(angleInRadians)),
    		y: centerY + (radius * Math.sin(angleInRadians))
    	};
    }

    function describeArc(x, y, radius, startPerc, endPerc){

    	const startAngle = startPerc / 100 * 360;
    	const endAngle = endPerc / 100 * 360;
    	const start = polarToCartesian(x, y, radius, endAngle);
    	const end = polarToCartesian(x, y, radius, startAngle);

    	const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    	return [
    		"M", start.x, start.y,
    		"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    	].join(" ");

    }

    function instance($$self, $$props, $$invalidate) {
    	let $prevOffset, $offset;

    	let { offset } = $$props; subscribe($$self, offset, $$value => { $offset = $$value; $$invalidate('$offset', $offset); });
    	let { prevOffset, color, thickness } = $$props; subscribe($$self, prevOffset, $$value => { $prevOffset = $$value; $$invalidate('$prevOffset', $prevOffset); });

    	if(!thickness)
    		$$invalidate('thickness', thickness = 2);

    	$$self.$set = $$props => {
    		if ('offset' in $$props) $$invalidate('offset', offset = $$props.offset);
    		if ('prevOffset' in $$props) $$invalidate('prevOffset', prevOffset = $$props.prevOffset);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    		if ('thickness' in $$props) $$invalidate('thickness', thickness = $$props.thickness);
    	};

    	return {
    		offset,
    		prevOffset,
    		color,
    		thickness,
    		$prevOffset,
    		$offset
    	};
    }

    class Arc extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, ["offset", "prevOffset", "color", "thickness"]);
    	}
    }

    /* src/RadialProgressBar.svelte generated by Svelte v3.6.7 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.serie = list[i];
    	return child_ctx;
    }

    // (71:1) {#each series as serie}
    function create_each_block(ctx) {
    	var current;

    	var arc = new Arc({
    		props: {
    		offset: ctx.serie.offset,
    		prevOffset: ctx.serie.prevOffset,
    		color: ctx.serie.color,
    		thickness: ctx.thickness
    	}
    	});

    	return {
    		c() {
    			arc.$$.fragment.c();
    		},

    		m(target, anchor) {
    			mount_component(arc, target, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var arc_changes = {};
    			if (changed.series) arc_changes.offset = ctx.serie.offset;
    			if (changed.series) arc_changes.prevOffset = ctx.serie.prevOffset;
    			if (changed.series) arc_changes.color = ctx.serie.color;
    			if (changed.thickness) arc_changes.thickness = ctx.thickness;
    			arc.$set(arc_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(arc.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(arc.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			destroy_component(arc, detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var svg, defs, mask, circle0, circle0_r_value, circle1, text0, t0, text0_font_size_value, text1, t1, text1_mask_value, text1_font_size_value, svg_viewBox_value, current;

    	var arc_spread_levels = [
    		ctx.maskSerie,
    		{ thickness: ctx.thickness }
    	];

    	let arc_props = {};
    	for (var i = 0; i < arc_spread_levels.length; i += 1) {
    		arc_props = assign(arc_props, arc_spread_levels[i]);
    	}
    	var arc = new Arc({ props: arc_props });

    	var each_value = ctx.series;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			mask = svg_element("mask");
    			arc.$$.fragment.c();
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			text0 = svg_element("text");
    			t0 = text(ctx.$valStore);
    			text1 = svg_element("text");
    			t1 = text(ctx.$valStore);
    			attr(circle0, "cx", "50");
    			attr(circle0, "cy", "50");
    			attr(circle0, "r", circle0_r_value = 50 - ctx.thickness);
    			attr(circle0, "fill", "#fff");
    			attr(mask, "id", ctx.maskId);
    			attr(mask, "x", "0");
    			attr(mask, "y", "0");
    			attr(mask, "width", "100");
    			attr(mask, "height", "100%");
    			attr(circle1, "class", "progress-bg svelte-j462iq");
    			attr(circle1, "cx", "50");
    			attr(circle1, "cy", "50");
    			attr(circle1, "r", "49");
    			attr(text0, "class", "progress-value progress-value-inverted svelte-j462iq");
    			attr(text0, "text-anchor", "middle");
    			attr(text0, "dominant-baseline", "central");
    			attr(text0, "x", "50%");
    			attr(text0, "y", "50%");
    			attr(text0, "font-size", text0_font_size_value = "" + ctx.textSize + "%");
    			attr(text1, "mask", text1_mask_value = "url(#" + ctx.maskId + ")");
    			attr(text1, "class", "progress-value");
    			attr(text1, "text-anchor", "middle");
    			attr(text1, "dominant-baseline", "central");
    			attr(text1, "x", "50%");
    			attr(text1, "y", "50%");
    			attr(text1, "font-size", text1_font_size_value = "" + ctx.textSize + "%");
    			attr(svg, "class", "progressbar progressbar-radial svelte-j462iq");
    			attr(svg, "viewBox", svg_viewBox_value = "0 0 " + vbWidth + " " + ctx.vbHeight);
    			attr(svg, "width", ctx.width);
    			attr(svg, "height", ctx.height);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    		},

    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, defs);
    			append(defs, mask);
    			mount_component(arc, mask, null);
    			append(mask, circle0);
    			append(svg, circle1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			append(svg, text0);
    			append(text0, t0);
    			append(svg, text1);
    			append(text1, t1);
    			current = true;
    		},

    		p(changed, ctx) {
    			var arc_changes = (changed.maskSerie || changed.thickness) ? get_spread_update(arc_spread_levels, [
    				(changed.maskSerie) && ctx.maskSerie,
    				(changed.thickness) && { thickness: ctx.thickness }
    			]) : {};
    			arc.$set(arc_changes);

    			if ((!current || changed.thickness) && circle0_r_value !== (circle0_r_value = 50 - ctx.thickness)) {
    				attr(circle0, "r", circle0_r_value);
    			}

    			if (changed.series || changed.thickness) {
    				each_value = ctx.series;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(svg, text0);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}

    			if (!current || changed.$valStore) {
    				set_data(t0, ctx.$valStore);
    			}

    			if ((!current || changed.textSize) && text0_font_size_value !== (text0_font_size_value = "" + ctx.textSize + "%")) {
    				attr(text0, "font-size", text0_font_size_value);
    			}

    			if (!current || changed.$valStore) {
    				set_data(t1, ctx.$valStore);
    			}

    			if ((!current || changed.textSize) && text1_font_size_value !== (text1_font_size_value = "" + ctx.textSize + "%")) {
    				attr(text1, "font-size", text1_font_size_value);
    			}

    			if (!current || changed.width) {
    				attr(svg, "width", ctx.width);
    			}

    			if (!current || changed.height) {
    				attr(svg, "height", ctx.height);
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(arc.$$.fragment, local);

    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o(local) {
    			transition_out(arc.$$.fragment, local);

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(svg);
    			}

    			destroy_component(arc, );

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    const vbWidth = 100;

    function instance$1($$self, $$props, $$invalidate) {
    	let $valStore;

    	

    	let { series = [], thickness = null, width = 100, height = 100 } = $$props;

    	let textSize;

    	const ts = new Date().getTime();
    	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
    	const valStore = getContext('valStore'); subscribe($$self, valStore, $$value => { $valStore = $$value; $$invalidate('$valStore', $valStore); });
    	const vbHeight = vbWidth * (height / width);

    	const twOpts = {
    		duration: 1000,
    		easing: cubicOut
    	};

    	const maskSerie = {
    		offset: tweened(100, twOpts),
    		prevOffset: tweened(0, twOpts),
    		color: '#fff'
    	};

    	$$self.$set = $$props => {
    		if ('series' in $$props) $$invalidate('series', series = $$props.series);
    		if ('thickness' in $$props) $$invalidate('thickness', thickness = $$props.thickness);
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    	};

    	$$self.$$.update = ($$dirty = { series: 1 }) => {
    		if ($$dirty.series) { {
    				maskSerie.prevOffset.set(series.reduce((a, s) => a + s.perc < 100 ? a + s.perc : 100, 0));
    				$$invalidate('textSize', textSize =  150 / series.length);
    			} }
    	};

    	return {
    		series,
    		thickness,
    		width,
    		height,
    		textSize,
    		maskId,
    		valStore,
    		vbHeight,
    		maskSerie,
    		$valStore
    	};
    }

    class RadialProgressBar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["series", "thickness", "width", "height"]);
    	}
    }

    /* src/Stop.svelte generated by Svelte v3.6.7 */

    function create_fragment$2(ctx) {
    	var stop0, stop0_offset_value, t, stop1, stop1_offset_value;

    	return {
    		c() {
    			stop0 = svg_element("stop");
    			t = space();
    			stop1 = svg_element("stop");
    			attr(stop0, "offset", stop0_offset_value = "" + Math.round(ctx.$prevOffset * 100 / ctx.$overallPerc) + "%");
    			attr(stop0, "stop-color", ctx.color);
    			attr(stop1, "offset", stop1_offset_value = "" + Math.round(ctx.$offset * 100 / ctx.$overallPerc) + "%");
    			attr(stop1, "stop-color", ctx.color);
    		},

    		m(target, anchor) {
    			insert(target, stop0, anchor);
    			insert(target, t, anchor);
    			insert(target, stop1, anchor);
    		},

    		p(changed, ctx) {
    			if ((changed.$prevOffset || changed.$overallPerc) && stop0_offset_value !== (stop0_offset_value = "" + Math.round(ctx.$prevOffset * 100 / ctx.$overallPerc) + "%")) {
    				attr(stop0, "offset", stop0_offset_value);
    			}

    			if (changed.color) {
    				attr(stop0, "stop-color", ctx.color);
    			}

    			if ((changed.$offset || changed.$overallPerc) && stop1_offset_value !== (stop1_offset_value = "" + Math.round(ctx.$offset * 100 / ctx.$overallPerc) + "%")) {
    				attr(stop1, "offset", stop1_offset_value);
    			}

    			if (changed.color) {
    				attr(stop1, "stop-color", ctx.color);
    			}
    		},

    		i: noop,
    		o: noop,

    		d(detaching) {
    			if (detaching) {
    				detach(stop0);
    				detach(t);
    				detach(stop1);
    			}
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $prevOffset, $overallPerc, $offset;

    	let { prevOffset } = $$props; subscribe($$self, prevOffset, $$value => { $prevOffset = $$value; $$invalidate('$prevOffset', $prevOffset); });
    	let { offset } = $$props; subscribe($$self, offset, $$value => { $offset = $$value; $$invalidate('$offset', $offset); });
    	let { overallPerc, color } = $$props; subscribe($$self, overallPerc, $$value => { $overallPerc = $$value; $$invalidate('$overallPerc', $overallPerc); });

    	$$self.$set = $$props => {
    		if ('prevOffset' in $$props) $$invalidate('prevOffset', prevOffset = $$props.prevOffset);
    		if ('offset' in $$props) $$invalidate('offset', offset = $$props.offset);
    		if ('overallPerc' in $$props) $$invalidate('overallPerc', overallPerc = $$props.overallPerc);
    		if ('color' in $$props) $$invalidate('color', color = $$props.color);
    	};

    	return {
    		prevOffset,
    		offset,
    		overallPerc,
    		color,
    		$prevOffset,
    		$overallPerc,
    		$offset
    	};
    }

    class Stop extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["prevOffset", "offset", "overallPerc", "color"]);
    	}
    }

    /* src/LinearProgressBar.svelte generated by Svelte v3.6.7 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.serie = list[i];
    	return child_ctx;
    }

    // (63:3) {#each series as serie}
    function create_each_block$1(ctx) {
    	var current;

    	var stop = new Stop({
    		props: {
    		prevOffset: ctx.serie.prevOffset,
    		offset: ctx.serie.offset,
    		color: ctx.serie.color,
    		overallPerc: ctx.overallPerc
    	}
    	});

    	return {
    		c() {
    			stop.$$.fragment.c();
    		},

    		m(target, anchor) {
    			mount_component(stop, target, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var stop_changes = {};
    			if (changed.series) stop_changes.prevOffset = ctx.serie.prevOffset;
    			if (changed.series) stop_changes.offset = ctx.serie.offset;
    			if (changed.series) stop_changes.color = ctx.serie.color;
    			if (changed.overallPerc) stop_changes.overallPerc = ctx.overallPerc;
    			stop.$set(stop_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(stop.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(stop.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			destroy_component(stop, detaching);
    		}
    	};
    }

    // (67:2) {#if style == 'default'}
    function create_if_block_1(ctx) {
    	var mask, rect, rect_width_value, rect_x_value;

    	return {
    		c() {
    			mask = svg_element("mask");
    			rect = svg_element("rect");
    			attr(rect, "width", rect_width_value = "" + (100 - ctx.$overallPerc) + "%");
    			attr(rect, "height", "100%");
    			attr(rect, "x", rect_x_value = "" + ctx.$overallPerc + "%");
    			attr(rect, "y", "0");
    			attr(rect, "fill", "#fff");
    			attr(mask, "id", ctx.maskId);
    			attr(mask, "x", "0");
    			attr(mask, "y", "0");
    			attr(mask, "width", "100");
    			attr(mask, "height", "100%");
    		},

    		m(target, anchor) {
    			insert(target, mask, anchor);
    			append(mask, rect);
    		},

    		p(changed, ctx) {
    			if ((changed.$overallPerc) && rect_width_value !== (rect_width_value = "" + (100 - ctx.$overallPerc) + "%")) {
    				attr(rect, "width", rect_width_value);
    			}

    			if ((changed.$overallPerc) && rect_x_value !== (rect_x_value = "" + ctx.$overallPerc + "%")) {
    				attr(rect, "x", rect_x_value);
    			}
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(mask);
    			}
    		}
    	};
    }

    // (78:1) {:else}
    function create_else_block(ctx) {
    	var text0, t0, text1, t1, text1_mask_value;

    	return {
    		c() {
    			text0 = svg_element("text");
    			t0 = text(ctx.$valStore);
    			text1 = svg_element("text");
    			t1 = text(ctx.$valStore);
    			attr(text0, "class", "progress-value progress-value-inverted svelte-gfj393");
    			attr(text0, "text-anchor", "middle");
    			attr(text0, "dominant-baseline", "central");
    			attr(text0, "x", "50%");
    			attr(text0, "y", "50%");
    			attr(text1, "mask", text1_mask_value = "url(#" + ctx.maskId + ")");
    			attr(text1, "class", "progress-value svelte-gfj393");
    			attr(text1, "text-anchor", "middle");
    			attr(text1, "dominant-baseline", "central");
    			attr(text1, "x", "50%");
    			attr(text1, "y", "50%");
    		},

    		m(target, anchor) {
    			insert(target, text0, anchor);
    			append(text0, t0);
    			insert(target, text1, anchor);
    			append(text1, t1);
    		},

    		p(changed, ctx) {
    			if (changed.$valStore) {
    				set_data(t0, ctx.$valStore);
    				set_data(t1, ctx.$valStore);
    			}
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(text0);
    				detach(text1);
    			}
    		}
    	};
    }

    // (76:1) {#if style == 'thin'}
    function create_if_block(ctx) {
    	var text_1, t, text_1_y_value;

    	return {
    		c() {
    			text_1 = svg_element("text");
    			t = text(ctx.$valStore);
    			attr(text_1, "class", "progress-value svelte-gfj393");
    			attr(text_1, "text-anchor", "middle");
    			attr(text_1, "dominant-baseline", "central");
    			attr(text_1, "x", "50%");
    			attr(text_1, "y", text_1_y_value = "" + (65 - ctx.thickness) + "%");
    		},

    		m(target, anchor) {
    			insert(target, text_1, anchor);
    			append(text_1, t);
    		},

    		p(changed, ctx) {
    			if (changed.$valStore) {
    				set_data(t, ctx.$valStore);
    			}

    			if ((changed.thickness) && text_1_y_value !== (text_1_y_value = "" + (65 - ctx.thickness) + "%")) {
    				attr(text_1, "y", text_1_y_value);
    			}
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(text_1);
    			}
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var svg, defs, linearGradient, rect0, rect0_height_value, rect0_y_value, rect1, rect1_width_value, rect1_height_value, rect1_y_value, rect1_fill_value, svg_viewBox_value, current;

    	var each_value = ctx.series;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	var if_block0 = (ctx.style == 'default') && create_if_block_1(ctx);

    	function select_block_type(ctx) {
    		if (ctx.style == 'thin') return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block1 = current_block_type(ctx);

    	return {
    		c() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			linearGradient = svg_element("linearGradient");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (if_block0) if_block0.c();
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			if_block1.c();
    			attr(linearGradient, "id", ctx.grId);
    			attr(rect0, "width", "100");
    			attr(rect0, "height", rect0_height_value = "" + ctx.thickness + "%");
    			attr(rect0, "rx", ctx.rx);
    			attr(rect0, "ry", ctx.ry);
    			attr(rect0, "y", rect0_y_value = "" + ctx.ypos + "%");
    			attr(rect0, "class", "progress-bg svelte-gfj393");
    			attr(rect1, "width", rect1_width_value = "" + ctx.$overallPerc + "%");
    			attr(rect1, "height", rect1_height_value = "" + ctx.thickness + "%");
    			attr(rect1, "rx", ctx.rx);
    			attr(rect1, "ry", ctx.ry);
    			attr(rect1, "y", rect1_y_value = "" + (100 - ctx.thickness) + "%");
    			attr(rect1, "fill", rect1_fill_value = "url(#" + ctx.grId + ")");
    			attr(svg, "class", "progressbar");
    			attr(svg, "viewBox", svg_viewBox_value = "0 0 100 " + ctx.vbHeight);
    			attr(svg, "width", ctx.width);
    			attr(svg, "height", ctx.height);
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    		},

    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, defs);
    			append(defs, linearGradient);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(linearGradient, null);
    			}

    			if (if_block0) if_block0.m(defs, null);
    			append(svg, rect0);
    			append(svg, rect1);
    			if_block1.m(svg, null);
    			current = true;
    		},

    		p(changed, ctx) {
    			if (changed.series || changed.overallPerc) {
    				each_value = ctx.series;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(linearGradient, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}

    			if (ctx.style == 'default') {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(defs, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || changed.thickness) && rect0_height_value !== (rect0_height_value = "" + ctx.thickness + "%")) {
    				attr(rect0, "height", rect0_height_value);
    			}

    			if (!current || changed.rx) {
    				attr(rect0, "rx", ctx.rx);
    			}

    			if (!current || changed.ry) {
    				attr(rect0, "ry", ctx.ry);
    			}

    			if ((!current || changed.ypos) && rect0_y_value !== (rect0_y_value = "" + ctx.ypos + "%")) {
    				attr(rect0, "y", rect0_y_value);
    			}

    			if ((!current || changed.$overallPerc) && rect1_width_value !== (rect1_width_value = "" + ctx.$overallPerc + "%")) {
    				attr(rect1, "width", rect1_width_value);
    			}

    			if ((!current || changed.thickness) && rect1_height_value !== (rect1_height_value = "" + ctx.thickness + "%")) {
    				attr(rect1, "height", rect1_height_value);
    			}

    			if (!current || changed.rx) {
    				attr(rect1, "rx", ctx.rx);
    			}

    			if (!current || changed.ry) {
    				attr(rect1, "ry", ctx.ry);
    			}

    			if ((!current || changed.thickness) && rect1_y_value !== (rect1_y_value = "" + (100 - ctx.thickness) + "%")) {
    				attr(rect1, "y", rect1_y_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(changed, ctx);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);
    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(svg, null);
    				}
    			}

    			if (!current || changed.width) {
    				attr(svg, "width", ctx.width);
    			}

    			if (!current || changed.height) {
    				attr(svg, "height", ctx.height);
    			}
    		},

    		i(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d(detaching) {
    			if (detaching) {
    				detach(svg);
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block0) if_block0.d();
    			if_block1.d();
    		}
    	};
    }

    const minOverallPerc = 0.001;

    function instance$3($$self, $$props, $$invalidate) {
    	let $overallPerc, $valStore;

    	

    	let { series = [], style = 'default', rx = 2, ry = 2, width = 100, height = 16, thickness } = $$props;
    	const ts = new Date().getTime();
    	const vbHeight = 100 * (height / width);
    	const valStore = getContext('valStore'); subscribe($$self, valStore, $$value => { $valStore = $$value; $$invalidate('$valStore', $valStore); });
    	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
    	const grId = 'pb_gradient_' + ts + Math.floor(Math.random() * 999);

    	let ypos = 0;
    	if(style == 'thin') {
    		if(!thickness)
    			$$invalidate('thickness', thickness = 10);
    		$$invalidate('rx', rx = .2);
    		$$invalidate('ry', ry = .2);
    		$$invalidate('ypos', ypos = 100 - thickness);
    	}
    	else {
    		$$invalidate('thickness', thickness = 100);
    	}

    	//Start with a number slightly greater than 0 to avoid divisions by zero when computing stops
    	const overallPerc = tweened(minOverallPerc, {
    		duration: 1000,
    		easing: cubicOut
    	}); subscribe($$self, overallPerc, $$value => { $overallPerc = $$value; $$invalidate('$overallPerc', $overallPerc); });

    	$$self.$set = $$props => {
    		if ('series' in $$props) $$invalidate('series', series = $$props.series);
    		if ('style' in $$props) $$invalidate('style', style = $$props.style);
    		if ('rx' in $$props) $$invalidate('rx', rx = $$props.rx);
    		if ('ry' in $$props) $$invalidate('ry', ry = $$props.ry);
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    		if ('thickness' in $$props) $$invalidate('thickness', thickness = $$props.thickness);
    	};

    	$$self.$$.update = ($$dirty = { series: 1 }) => {
    		if ($$dirty.series) { {
    				overallPerc.set(series.reduce((a, s) => a + s.perc < 100 ? a + s.perc : 100, minOverallPerc));
    			} }
    	};

    	return {
    		series,
    		style,
    		rx,
    		ry,
    		width,
    		height,
    		thickness,
    		vbHeight,
    		valStore,
    		maskId,
    		grId,
    		ypos,
    		overallPerc,
    		$overallPerc,
    		$valStore
    	};
    }

    class LinearProgressBar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["series", "style", "rx", "ry", "width", "height", "thickness"]);
    	}
    }

    /* src/index.svelte generated by Svelte v3.6.7 */

    // (75:0) {:else}
    function create_else_block$1(ctx) {
    	var current;

    	var linearprogressbar = new LinearProgressBar({
    		props: {
    		series: ctx.series,
    		style: ctx.style,
    		width: ctx.width,
    		height: ctx.height,
    		thickness: ctx.thickness
    	}
    	});

    	return {
    		c() {
    			linearprogressbar.$$.fragment.c();
    		},

    		m(target, anchor) {
    			mount_component(linearprogressbar, target, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var linearprogressbar_changes = {};
    			if (changed.series) linearprogressbar_changes.series = ctx.series;
    			if (changed.style) linearprogressbar_changes.style = ctx.style;
    			if (changed.width) linearprogressbar_changes.width = ctx.width;
    			if (changed.height) linearprogressbar_changes.height = ctx.height;
    			if (changed.thickness) linearprogressbar_changes.thickness = ctx.thickness;
    			linearprogressbar.$set(linearprogressbar_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(linearprogressbar.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(linearprogressbar.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			destroy_component(linearprogressbar, detaching);
    		}
    	};
    }

    // (73:0) {#if style == 'radial'}
    function create_if_block$1(ctx) {
    	var current;

    	var radialprogressbar = new RadialProgressBar({
    		props: {
    		series: ctx.series,
    		thickness: ctx.thickness,
    		width: ctx.width,
    		height: ctx.height
    	}
    	});

    	return {
    		c() {
    			radialprogressbar.$$.fragment.c();
    		},

    		m(target, anchor) {
    			mount_component(radialprogressbar, target, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var radialprogressbar_changes = {};
    			if (changed.series) radialprogressbar_changes.series = ctx.series;
    			if (changed.thickness) radialprogressbar_changes.thickness = ctx.thickness;
    			if (changed.width) radialprogressbar_changes.width = ctx.width;
    			if (changed.height) radialprogressbar_changes.height = ctx.height;
    			radialprogressbar.$set(radialprogressbar_changes);
    		},

    		i(local) {
    			if (current) return;
    			transition_in(radialprogressbar.$$.fragment, local);

    			current = true;
    		},

    		o(local) {
    			transition_out(radialprogressbar.$$.fragment, local);
    			current = false;
    		},

    		d(detaching) {
    			destroy_component(radialprogressbar, detaching);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$1,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.style == 'radial') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

    	let { style = 'default', width = null, thickness = null, height = null } = $$props;

    	if(width == null)
    		$$invalidate('width', width = style == 'radial' ? 75 : 150);

    	if(height == null)
    		$$invalidate('height', height = style == 'radial' ? width : 16 * width / 100);

    	let { colors = [
    		'#FFC107',
    		'#4CAF50',
    		'#03A9F4'
    	], series = [] } = $$props;

    	const twOpts = {
    		duration: 1000,
    		easing: cubicOut
    	};

    	if(!Array.isArray(series))
    		$$invalidate('series', series = [series]);

    	$$invalidate('series', series = series.map((s, idx) => {
    		if(typeof s != 'object')
    			s = {perc: s};

    		s.offset = tweened(0, twOpts);
    		s.prevOffset = tweened(0, twOpts);

    		if(!s.color)
    			s.color = colors[idx % colors.length];

    		return s;
    	}));

    	const valueStore = tweened(Array(series.length).fill(0), twOpts);
    	const valStore = derived(
    		valueStore,
    		$valueStore => $valueStore.map(s => Math.round(s) + '%').join(' + ')
    	);

    	setContext('valStore', valStore);

    	function updatePerc(perc, seriesIdx = 0) {
    		series[seriesIdx].perc = perc; $$invalidate('series', series);
    	}

    	$$self.$set = $$props => {
    		if ('style' in $$props) $$invalidate('style', style = $$props.style);
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('thickness' in $$props) $$invalidate('thickness', thickness = $$props.thickness);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    		if ('colors' in $$props) $$invalidate('colors', colors = $$props.colors);
    		if ('series' in $$props) $$invalidate('series', series = $$props.series);
    	};

    	$$self.$$.update = ($$dirty = { series: 1 }) => {
    		if ($$dirty.series) { {
    				valueStore.set(series.map(s => s.perc));
    		
    				let cumOffset = 0;
    				series.forEach((s, idx) => {
    					s.prevOffset.set(cumOffset);
    					cumOffset += s.perc;
    					s.offset.set(cumOffset);
    				});
    			} }
    	};

    	return {
    		style,
    		width,
    		thickness,
    		height,
    		colors,
    		series,
    		updatePerc
    	};
    }

    class Index extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["style", "width", "thickness", "height", "colors", "series", "updatePerc"]);
    	}

    	get updatePerc() {
    		return this.$$.ctx.updatePerc;
    	}
    }

    return Index;

}));
