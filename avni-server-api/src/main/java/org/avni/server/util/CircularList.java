package org.avni.server.util;

import java.util.Iterator;
import java.util.List;
import java.util.Spliterator;
import java.util.function.Consumer;

public class CircularList<T> implements Iterable<T>{
    private List<T> source;
    private int index = 0;

    public CircularList(List<T> source) {
        this.source = source;
    }

    private int moveIndex() {
        int currentIndex = index;
        if (source.size() > 0) {
            index = (index + 1)%source.size();
        }
        return currentIndex;
    }

    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            @Override
            public boolean hasNext() {
                return true;
            }

            @Override
            public T next() {
                return source.get(moveIndex());
            }
        };
    }

    @Override
    public void forEach(Consumer<? super T> action) {
        Iterable.super.forEach(action);
    }

    @Override
    public Spliterator<T> spliterator() {
        return Iterable.super.spliterator();
    }
}
