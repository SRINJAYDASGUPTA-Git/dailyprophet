package net.ibmer.dailyprophet.exceptions;

public class ExistingEmailConflictException extends RuntimeException {
    public ExistingEmailConflictException(String message) {
        super(message);
    }
}