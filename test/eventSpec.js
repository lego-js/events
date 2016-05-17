describe('The event service', function() {

    beforeEach(function() {
        this.node = document.createElement('div');
    });

    it('can set and get a value from a single element', function() {

        events.on(this.node, 'foo', function(e) { return e; });
        expect(this.node).toBe(this.node);
    });
});
