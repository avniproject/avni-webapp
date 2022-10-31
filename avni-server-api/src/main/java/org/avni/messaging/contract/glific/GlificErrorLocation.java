package org.avni.messaging.contract.glific;

public class GlificErrorLocation {
    private int column;
    private int row;

    public int getColumn() {
        return column;
    }

    public void setColumn(int column) {
        this.column = column;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    @Override
    public String toString() {
        return "GlificErrorLocation{" +
                "column=" + column +
                ", row=" + row +
                '}';
    }
}
