---
title: onGetStateFromStorage
name: options-ongetstatefromstorage
---

Read the saved state from somewhere other than localStorage. Use it together with [onSetStateFromStorage](#options-onsetstatefromstorage) and [saveState](#options-savestate).

The function is called without parameters and must return the state as a JSON string, the string that `onSetStateFromStorage` received. It is called synchronously, so the state must already be available. Return an empty string when there is no saved state.

{% highlight js %}
$('#tree1').tree({
    data: data,
    saveState: true,
    onGetStateFromStorage: function() {
        return sessionStorage.getItem('tree1-state') || '';
    },
    onSetStateFromStorage: function(state) {
        sessionStorage.setItem('tree1-state', state);
    }
});
{% endhighlight %}
