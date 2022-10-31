package org.avni.server.web.request.webapp.search;

public abstract class RangeFilter<T> {
    private T minValue;
    private T maxValue;

    public RangeFilter(T minValue, T maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    public T getMinValue() {
        return minValue;
    }

    public void setMinValue(T minValue) {
        this.minValue = minValue;
    }

    public T getMaxValue() {
        return maxValue;
    }

    public boolean isEmpty() {
     return this.getMinValue() == null && this.getMaxValue() == null;
    }

    public void setMaxValue(T maxValue) {
        this.maxValue = maxValue;
    }
}
