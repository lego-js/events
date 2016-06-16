describe('The event service', function () {

    beforeEach(function () {
        this.node = document.createElement('div');
        this.elem = document.createElement('div');
    });

    var onClick = function () {
        this.innerHTML += ' click ';
    };

    var onWidget = function () {
        this.innerHTML += ' widget ';
    };

    var onFoo = function () {
        this.innerHTML += ' foo ';
    };

    var onScroll = function () {
        this.innerHTML += ' scroll ';
    };

    it('can listen for dom events', function () {
        events.on(this.node, 'click', onClick);

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click ');
    });

    it('can stop listening to dom events', function () {
        events.on(this.node, 'click', onClick);
        events.off(this.node, 'click', onClick);

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe('');
    });

    it('can listen to and array of events', function () {
        events.on(this.node, ['click', 'keydown'], onClick);

        this.node.dispatchEvent(new Event('click'));
        this.node.dispatchEvent(new Event('keydown'));

        expect(this.node.innerHTML).toBe(' click  click ');
    });

    it('can remove an array of events', function () {
        events.on(this.node, ['click', 'keydown'], onClick);

        this.node.dispatchEvent(new Event('click'));
        this.node.dispatchEvent(new Event('keydown'));

        expect(this.node.innerHTML).toBe(' click  click ');

        events.off(this.node, ['click', 'keydown'], onClick);
        this.node.innerHTML = '';

        this.node.dispatchEvent(new Event('click'));
        this.node.dispatchEvent(new Event('keydown'));

        expect(this.node.innerHTML).toBe('');
    });

    it('can remove one event from an array of bound events', function () {
        events.on(this.node, ['click', 'keydown'], onClick);

        this.node.dispatchEvent(new Event('click'));
        this.node.dispatchEvent(new Event('keydown'));

        expect(this.node.innerHTML).toBe(' click  click ');

        events.off(this.node, 'keydown', onClick);
        this.node.innerHTML = '';

        this.node.dispatchEvent(new Event('click'));
        this.node.dispatchEvent(new Event('keydown'));

        expect(this.node.innerHTML).toBe(' click ');
    });

    it('can listen to a hash of events', function () {
        events.on(this.node, {
            click: onClick,
            widget: onWidget,
            foo: onFoo,
        });

        this.node.dispatchEvent(new Event('click'));
        this.node.dispatchEvent(new Event('foo'));
        this.node.dispatchEvent(new Event('widget'));

        expect(this.node.innerHTML).toBe(' click  foo  widget ');
    });

    it('can remove multiple events listeners with a hash of events', function () {
        events.on(this.node, 'click', onClick);
        events.on(this.node, 'widget', onWidget);
        events.on(this.node, 'foo', onFoo);

        this.node.dispatchEvent(new Event('click'));
        this.node.dispatchEvent(new Event('widget'));
        this.node.dispatchEvent(new Event('foo'));

        expect(this.node.innerHTML).toBe(' click  widget  foo ');
        this.node.innerHTML = '';

        events.off(this.node, {
            click: onClick,
            foo: onFoo,
        });

        this.node.dispatchEvent(new Event('click'));
        this.node.dispatchEvent(new Event('widget'));
        this.node.dispatchEvent(new Event('foo'));

        expect(this.node.innerHTML).toBe(' widget ');
    });

    it('can listen to an event on an array of elements', function () {
        events.on([this.node, this.elem], 'click', onClick);

        this.node.dispatchEvent(new Event('click'));
        this.elem.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click ');
        expect(this.elem.innerHTML).toBe(' click ');
    });

    it('can listen to an event on a NodeList of elements', function () {
        this.node.classList.add('my-widget');
        this.elem.classList.add('my-widget');
        document.body.appendChild(this.node);
        document.body.appendChild(this.elem);

        events.on(document.querySelectorAll('.my-widget'), 'click', onClick);

        this.node.dispatchEvent(new Event('click'));
        this.elem.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click ');
        expect(this.elem.innerHTML).toBe(' click ');

        document.body.removeChild(this.node);
        document.body.removeChild(this.elem);
    });

    it('can listen to an array of events on an array of elements', function () {
        events.on([this.node, this.elem], ['click', 'keydown'], onClick);

        this.node.dispatchEvent(new Event('click'));
        this.elem.dispatchEvent(new Event('click'));
        this.elem.dispatchEvent(new Event('keydown'));

        expect(this.node.innerHTML).toBe(' click ');
        expect(this.elem.innerHTML).toBe(' click  click ');
    });

    it('can remove events from an array of elements', function () {
        events.on(this.node, 'click', onClick);
        events.on(this.elem, 'click', onClick);

        this.node.dispatchEvent(new Event('click'));
        this.elem.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click ');
        expect(this.elem.innerHTML).toBe(' click ');
        this.node.innerHTML = this.elem.innerHTML = '';

        events.off([this.node, this.elem], 'click', onClick);

        this.node.dispatchEvent(new Event('click'));
        this.elem.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe('');
        expect(this.elem.innerHTML).toBe('');
    });

    it('only fires a function once per event, even if the listener is added multiple times', function () {
        events.on(this.node, 'click', onClick);
        events.on(this.node, 'click', onClick);

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click ');

        events.off(this.node, 'click', onClick);
        this.node.innerHTML = '';
        
        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe('');
    });
    
    it('can remove all functions listening to a specific event', function () {
        events.on(this.node, 'click', onClick);
        events.on(this.node, 'click', onWidget);
        events.on(this.node, 'click', onFoo);

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click  widget  foo ');
        this.node.innerHTML = '';

        events.off(this.node, 'click');

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe('');
    });

    it('can add, remove and then re-add a listener', function () {
        events.on(this.node, 'click', onClick);

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click ');
        this.node.innerHTML = '';

        events.off(this.node, 'click', onClick);

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe('');
        this.node.innerHTML = '';

        events.on(this.node, 'click', onClick);

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click ');
    });

    it('will listen to an event once using the "one" method', function () {
        events.one(this.node, 'click', onClick);

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe(' click ');
        this.node.innerHTML = '';

        this.node.dispatchEvent(new Event('click'));

        expect(this.node.innerHTML).toBe('');
    });

    describe("asynchronous specs", function() {

        beforeEach(function (done) {
            requestAnimationFrame(function() {
                requestAnimationFrame(done);
            });
        });

        it('will throttle special events that are commonly called in high volumes', function (done) {
            var node = document.createElement('div');

            events.on(node, 'scroll', onScroll);

            node.dispatchEvent(new Event('scroll'));
            node.dispatchEvent(new Event('scroll'));
            node.dispatchEvent(new Event('scroll'));
            node.dispatchEvent(new Event('scroll'));
            node.dispatchEvent(new Event('scroll'));

            requestAnimationFrame(function() {
                expect(node.innerHTML).toBe(' scroll ');
                done();
            });
        });

        it('can stop listening to throttled events', function (done) {
            var node = document.createElement('div');

            events.on(node, 'scroll', onScroll);
            node.dispatchEvent(new Event('scroll'));

            requestAnimationFrame(function() {
                expect(node.innerHTML).toBe(' scroll ');
                node.innerHTML = '';

                events.off(node, 'scroll', onScroll);
                node.dispatchEvent(new Event('scroll'));

                requestAnimationFrame(function() {
                    expect(node.innerHTML).toBe('');
                    done();
                });
            });
        });

        it('can add, remove and then re-add a throttled listener', function (done) {
            var node = document.createElement('div');

            events.on(node, 'scroll', onScroll);
            node.dispatchEvent(new Event('scroll'));

            requestAnimationFrame(function() {
                expect(node.innerHTML).toBe(' scroll ');
                node.innerHTML = '';

                events.off(node, 'scroll', onScroll);
                node.dispatchEvent(new Event('scroll'));

                requestAnimationFrame(function() {
                    expect(node.innerHTML).toBe('');
                    node.innerHTML = '';

                    events.on(node, 'scroll', onScroll);
                    node.dispatchEvent(new Event('scroll'));

                    requestAnimationFrame(function() {
                        expect(node.innerHTML).toBe(' scroll ');
                        done();
                    });
                });
            });
        });
    });

    it('will bypass throttling of high-volume events if third argument is true', function () {
        events.on(this.node, 'scroll', onScroll, true);

        this.node.dispatchEvent(new Event('scroll'));
        this.node.dispatchEvent(new Event('scroll'));
        this.node.dispatchEvent(new Event('scroll'));

        expect(this.node.innerHTML).toBe(' scroll  scroll  scroll ');
    });

    it('will bypass throttling of an array of high-volume events if third argument is true', function () {
        events.on(this.node, ['scroll', 'resize'], onScroll, true);

        this.node.dispatchEvent(new Event('scroll'));
        this.node.dispatchEvent(new Event('scroll'));
        this.node.dispatchEvent(new Event('scroll'));
        this.node.dispatchEvent(new Event('resize'));
        this.node.dispatchEvent(new Event('resize'));
        this.node.dispatchEvent(new Event('resize'));

        expect(this.node.innerHTML).toBe(' scroll  scroll  scroll  scroll  scroll  scroll ');
    });

    it('will bypass throttling of high-volume events on an array of elements if third argument is true', function () {
        events.on([this.node, this.elem], 'scroll', onScroll, true);

        this.node.dispatchEvent(new Event('scroll'));
        this.node.dispatchEvent(new Event('scroll'));
        this.node.dispatchEvent(new Event('scroll'));
        this.elem.dispatchEvent(new Event('scroll'));
        this.elem.dispatchEvent(new Event('scroll'));
        this.elem.dispatchEvent(new Event('scroll'));

        expect(this.node.innerHTML).toBe(' scroll  scroll  scroll ');
        expect(this.elem.innerHTML).toBe(' scroll  scroll  scroll ');
    });
});
